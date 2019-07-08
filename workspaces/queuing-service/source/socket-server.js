import { createCache } from './auto-pruning-cache'

export const maximumQueueSize = 10
export const maximumMessagesLength = 100000

export class SocketServer {
  constructor () {
    this.clients = []
    this.pendingMessages = createCache()
  }

  onConnection (clientSocket) {
    clientSocket.on('identify', (queueId, ack) => {
      console.log('identifying...')
      if (ack) {
        console.log('sending acknowledge to the client...')
        ack()
      }
      this.onIdentify(clientSocket, queueId)
    })
    clientSocket.on('message', message => {
      this.onMessage(clientSocket, message)
    })
    clientSocket.on('disconnect', reason => {
      this.onDisconnect(clientSocket)
    })
  }

  onIdentify (clientSocket, queueId) {
    let clientsForQueue = this.clients[queueId] || []
    if (clientsForQueue.length > 1) {
      clientSocket.emit('server error', 'too many clients for queue')
      return
    }

    clientsForQueue.push(clientSocket)
    this.clients[queueId] = clientsForQueue
    clientSocket.queueId = queueId
    this.deliverPendingMessages(clientSocket)
  }

  deliverPendingMessages (clientSocket) {
    console.log('delivering pending messages...')
    const queueId = clientSocket.queueId
    console.log('for queue', queueId)
    const pending = this.pendingMessages.get(queueId)
    if (pending) {
      pending.map(message => {
        console.log('delivering message: ', message)
        clientSocket.emit('message', message)
      })
      this.pendingMessages.del(queueId)
    }
  }

  onMessage (source, message) {
    if (!this.verifyMessage(message)) {
      source.emit('server error', 'message too long')
      return
    }

    const receiver = this.findReceiver(source)
    if (receiver) {
      receiver.emit('message', message)
    } else {
      this.addPendingMessages(source, message)
    }
  }

  verifyMessage (message) {
    return message.length <= maximumMessagesLength
  }

  onDisconnect (clientSocket) {
    // TODO this.clients[clientSocket.queueId] may be undefined
    if (!clientSocket.queueId) {
      return /* investigate! */
    }
    const clientsForQueue = this.clients[clientSocket.queueId]
    if (!clientsForQueue) {
      return
    }
    const remainingClients = clientsForQueue.filter(c => {
      return clientSocket !== c
    })
    if (remainingClients.length === 0) {
      delete this.clients[clientSocket.queueId]
    } else {
      this.clients[clientSocket.queueId] = remainingClients
    }
  }

  findReceiver (source) {
    const clientsForQueue = this.clients[source.queueId] || []
    const receivers = clientsForQueue.filter(c => {
      return source !== c && source.queueId === c.queueId
    })
    return receivers.length === 1 ? receivers[0] : undefined
  }

  addPendingMessages (source, message) {
    let queueId = source.queueId
    console.log('adding pending message', message)
    console.log('for queue', queueId)
    let pendingMessages = this.pendingMessages.get(queueId) || []
    if (pendingMessages.length === maximumQueueSize) {
      source.emit('server error', 'too many pending messagess')
      return
    }

    pendingMessages.push(message)
    this.pendingMessages.set(queueId, pendingMessages)
  }
}

export default class IOSocketServer {
  constructor (io) {
    this.socketServer = new SocketServer()
    this.io = io
  }

  start () {
    this.io.on('connection', socket => {
      this.socketServer.onConnection(socket)
    })
  }
}
