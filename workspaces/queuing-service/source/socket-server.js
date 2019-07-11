import { createCache } from './auto-pruning-cache'

export const maximumQueueSize = 10
export const maximumMessagesLength = 100000

class ServerError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ServerError'
    this.message = message
  }

  toJSON () {
    return {
      error: {
        name: this.name,
        message: this.message
        // stacktrace: this.stack
      }
    }
  }
}

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
      const status = this.onIdentify(clientSocket, { channelId, clientId })
      ack(status)
      if (!status.error) {
        this.deliverPendingMessages(clientSocket)
      }
    })
    clientSocket.on('message', (message, ack) => {
      this.onMessage(clientSocket, message, ack)
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
      return new ServerError('too many clients for queue')
    }

    clientsForQueue.push(clientSocket)
    this.clients[channelId] = clientsForQueue
    clientSocket.queueId = channelId
    clientSocket.clientId = clientId
    return true
  }

  deliverPendingMessages (recipientSocket) {
    console.log('delivering pending messages...')
    const queueId = recipientSocket.queueId
    console.log('for channelId', queueId)
    console.log('and clientId', recipientSocket.clientId)
    const pending = this.pendingMessages.get(queueId)
    if (pending) {
      const toBeKept = pending.filter(m => m.clientId === recipientSocket.clientId)
      const toBeDelivered = pending.filter(m => m.clientId !== recipientSocket.clientId)
      toBeDelivered.map(message => {
        console.log('delivering message: ', message.message)
        recipientSocket.emit('message', message.message)
      })
      if (toBeKept.length === 0) {
        this.pendingMessages.del(queueId)
      } else {
        this.pendingMessages.set(queueId, toBeKept)
      }
    }
  }

  onMessage (senderSocket, message, ack) {
    if (!this.verifyMessage(message)) {
      ack(new ServerError('message too long'))
      return
    }

    const receiver = this.findReceiver(senderSocket)
    if (receiver) {
      receiver.emit('message', message)
      ack(true)
    } else {
      ack(this.addPendingMessages(senderSocket, message))
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

  addPendingMessages (senderSocket, message) {
    const queueId = senderSocket.queueId
    const clientId = senderSocket.clientId
    console.log('adding pending message', message)
    console.log('for channelId:', queueId)
    console.log('and clientId:', clientId)
    let pendingMessages = this.pendingMessages.get(queueId) || []
    if (pendingMessages.length === maximumQueueSize) {
      console.log('too many pending messagess')
      return new ServerError('too many pending messagess')
    }
    pendingMessages.push({
      message,
      clientId
    })
    this.pendingMessages.set(queueId, pendingMessages)
    return true
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
