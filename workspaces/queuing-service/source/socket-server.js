import { createCache } from './auto-pruning-cache'
import { Logger } from './logger'
import { ServerError } from './server-error'

const maximumQueueSize = 10
const maximumMessagesLength = 100000

class SocketServer {
  constructor () {
    this.clients = []
    this.pendingMessages = createCache()
  }

  setVerbose (status) {
    Logger.setVerbose(status)
  }

  onConnection (clientSocket) {
    clientSocket.on('identify', ({ channelId, clientId }, ack) => {
      Logger.separator()
      Logger.logChannelAndClientIds('Identifying client', { channelId, clientId })
      const status = this.onIdentify(clientSocket, { channelId, clientId })
      ack(status)
      if (!status.error) {
        Logger.logInfo('identified OK')
        this.deliverPendingMessages(clientSocket)
      } else {
        Logger.logError(status.error.message)
      }
      Logger.separator()
    })
    clientSocket.on('message', (message, ack) => {
      this.onMessage(clientSocket, message, ack)
    })
    clientSocket.on('disconnect', reason => {
      Logger.separator()
      this.onDisconnect(clientSocket)
      Logger.separator()
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
      return new ServerError('too many clients for queue')
    }

    clientsForQueue.push(clientSocket)
    this.clients[channelId] = clientsForQueue
    clientSocket.channelId = channelId
    clientSocket.clientId = clientId
    return true
  }

  deliverPendingMessages (recipientSocket) {
    const channelId = recipientSocket.channelId
    const pending = this.pendingMessages.get(channelId)
    if (pending) {
      const toBeKept = pending.filter(m => m.clientId === recipientSocket.clientId)
      const toBeDelivered = pending.filter(m => m.clientId !== recipientSocket.clientId)
      if (toBeDelivered.length > 0) {
        Logger.logInfo('delivering pending messages...')
      }
      toBeDelivered.map(message => {
        Logger.logMessage(`{ sender: ${message.clientId}, recipient: ${recipientSocket.clientId}, message: ${message.message} }`)
        recipientSocket.emit('message', message.message)
      })
      if (toBeKept.length === 0) {
        this.pendingMessages.del(channelId)
      } else {
        this.pendingMessages.set(channelId, toBeKept)
      }
    }
  }

  onMessage (senderSocket, message, ack) {
    Logger.separator()
    if (!this.verifyMessage(message)) {
      Logger.logError('message too long')
      ack(new ServerError('message too long'))
      Logger.separator()
      return
    }

    const receiver = this.findReceiver(senderSocket)
    if (receiver) {
      Logger.logMessage(`{ sender: ${senderSocket.clientId}, recipient: ${receiver.clientId}, message: ${message} }`)
      receiver.emit('message', message)
      ack(true)
    } else {
      ack(this.addPendingMessage(senderSocket, message))
    }
    Logger.separator()
  }

  verifyMessage (message) {
    return message.length <= maximumMessagesLength
  }

  onDisconnect (clientSocket) {
    Logger.logChannelAndClientIds('disconnecting...', clientSocket)
    if (!clientSocket.channelId) {
      Logger.logInfo('!clientSocket.channelId')
      return
    }
    const clientsForQueue = this.clients[clientSocket.channelId]
    if (!clientsForQueue) {
      Logger.logInfo('!clientsForQueue')
      return
    }
    const remainingClients = clientsForQueue.filter(c => {
      return clientSocket !== c
    })
    if (remainingClients.length === 0) {
      Logger.logInfo('remainingClients.length === 0')
      delete this.clients[clientSocket.channelId]
    } else {
      this.clients[clientSocket.channelId] = remainingClients
    }
  }

  findReceiver (senderSocket) {
    const clientsForQueue = this.clients[senderSocket.channelId] || []
    const receivers = clientsForQueue.filter(c => {
      return senderSocket !== c && senderSocket.channelId === c.channelId
    })
    return receivers.length === 1 ? receivers[0] : undefined
  }

  addPendingMessage (senderSocket, message) {
    const channelId = senderSocket.channelId
    const clientId = senderSocket.clientId
    Logger.logInfo(`adding pending message on channel ${senderSocket.channelId}`)
    let pendingMessages = this.pendingMessages.get(channelId) || []
    if (pendingMessages.length === maximumQueueSize) {
      Logger.logError('too many pending messagess')
      return new ServerError('too many pending messagess')
    }
    Logger.logMessage(`{ sender: ${clientId},  message: ${message} }`)
    pendingMessages.push({
      message,
      clientId
    })
    this.pendingMessages.set(channelId, pendingMessages)
    return true
  }
}

class IOSocketServer {
  constructor (io) {
    this.socketServer = new SocketServer()
    this.io = io
  }

  setVerbose (status) {
    this.socketServer.setVerbose(status)
  }

  start () {
    this.io.on('connection', socket => {
      this.socketServer.onConnection(socket)
    })
  }
}

export {
  SocketServer,
  IOSocketServer,
  maximumQueueSize,
  maximumMessagesLength
}
