import { createCache } from './auto-pruning-cache'

export const maximumQueueSize = 10
export const maximumMessagesLength = 100000

export class SocketServer {
  constructor () {
    this.clients = []
    this.pendingMessages = createCache()
  }

  onConnection (clientSocket) {
    clientSocket.on('identify', ({ channelId, clientId }, ack) => {
      console.log('identifying:')
      console.log('channelId:', channelId)
      console.log('clientId:', clientId)
      if (ack) {
        console.log('sending acknowledge to the client...')
        ack()
      }
      this.onIdentify(clientSocket, { channelId, clientId })
    })
    clientSocket.on('message', message => {
      this.onMessage(clientSocket, message)
    })
    clientSocket.on('disconnect', reason => {
      this.onDisconnect(clientSocket)
    })
  }

  removeClientIdFromClients (clientId, clients) {
    return clients.filter(c => c.clientId !== clientId)
  }

  onIdentify (clientSocket, { channelId, clientId }) {
    let clientsForQueue = this.removeClientIdFromClients(
      clientId,
      this.clients[channelId] || []
    )
    if (clientsForQueue.length > 1) {
      console.log('ERROR! too many clients for queue')
      clientSocket.emit('server error', 'too many clients for queue')
      return
    }

    clientsForQueue.push(clientSocket)
    this.clients[channelId] = clientsForQueue
    clientSocket.queueId = channelId
    clientSocket.clientId = clientId
    this.deliverPendingMessages(clientSocket)
  }

  deliverPendingMessages (clientSocket) {
    console.log('delivering pending messages...')
    const queueId = clientSocket.queueId
    console.log('for channelId', queueId)
    console.log('and clientId', clientSocket.clientId)
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
    console.log('disconnecting:')
    console.log('channelId:', clientSocket.queueId)
    console.log('clientId:', clientSocket.clientId)
    if (!clientSocket.queueId) {
      console.log('!clientSocket.queueId')
      return
    }
    const clientsForQueue = this.clients[clientSocket.queueId]
    if (!clientsForQueue) {
      console.log('!clientsForQueue')
      return
    }
    const remainingClients = clientsForQueue.filter(c => {
      return clientSocket !== c
    })
    if (remainingClients.length === 0) {
      console.log('remainingClients.length === 0')
      delete this.clients[clientSocket.queueId]
    } else {
      this.clients[clientSocket.queueId] = remainingClients
    }
  }

  findReceiver (senderSocket) {
    const clientsForQueue = this.clients[senderSocket.queueId] || []
    const receivers = clientsForQueue.filter(c => {
      return senderSocket !== c && senderSocket.queueId === c.queueId
    })
    return receivers.length === 1 ? receivers[0] : undefined
  }

  addPendingMessages (source, message) {
    let queueId = source.queueId
    console.log('adding pending message', message)
    console.log('for channelId:', queueId)
    console.log('and clientId:', source.clientId)
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
