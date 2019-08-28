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
    clientSocket.on('identify', ({ channelId, clientId, service }, ack) => {
      Logger.separator()
      Logger.logChannelAndClientIds('Identifying client', { channelId, clientId, service })
      const status = this.onIdentify(clientSocket, { channelId, clientId, service })
      ack(status)
      if (!status.error) {
        Logger.logInfo('identified OK')
        this.deliverPendingMessages(clientSocket)
      } else {
        Logger.logError(status.error.message)
      }
      Logger.separator()
    })
    clientSocket.on('message', (message, params, ack) => {
      this.onMessage(clientSocket, message, params, ack)
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

  numerOfClientSocketWithRoleServer (clients) {
    return clients.filter(c => c.role === 'server').length
  }

  onIdentify (clientSocket, { channelId, clientId, service }) {
    const clientsForQueue = this.removeClientIdFromClients(
      clientId,
      this.clients[channelId] || []
    )
    if (!service && clientsForQueue.length > 1) {
      return new ServerError('too many clients for queue')
    }

    clientsForQueue.push(clientSocket)
    this.clients[channelId] = clientsForQueue
    clientSocket.channelId = channelId
    clientSocket.clientId = clientId
    if (service) {
      clientSocket.service = service
    }
    return true
  }

  deliverPendingMessagesForServiceChannel (recipientSocket) {
    const channelId = recipientSocket.channelId
    const pending = this.pendingMessages.get(channelId)
    const toBeKept = pending.filter(m => m.params.to !== recipientSocket.clientId)
    const toBeDelivered = pending.filter(m => m.params.to === recipientSocket.clientId)
    if (toBeDelivered.length > 0) {
      Logger.logInfo('delivering pending messages for the service channel...')
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

  deliverPendingMessagesForRegularChannel (recipientSocket) {
    const channelId = recipientSocket.channelId
    const pending = this.pendingMessages.get(channelId)
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

  deliverPendingMessages (recipientSocket) {
    const channelId = recipientSocket.channelId
    const pending = this.pendingMessages.get(channelId)
    if (pending) {
      if (recipientSocket.service) {
        this.deliverPendingMessagesForServiceChannel(recipientSocket)
      } else {
        this.deliverPendingMessagesForRegularChannel(recipientSocket)
      }
    }
  }

  onMessage (senderSocket, message, params, ack) {
    Logger.separator()
    if (!this.verifyMessage(senderSocket, message, params)) {
      Logger.logError('message corrupted or too long')
      ack(new ServerError('message corrupted or too long'))
      Logger.separator()
      return
    }

    if (senderSocket.service) {
      const receiver = this.findReceiverForServiceChannel(senderSocket, params.to)
      if (receiver) {
        Logger.logMessage(`{ sender: ${senderSocket.clientId}, recipient: ${receiver.clientId}, message: ${message}, params: ${params} }`)
        receiver.emit('message', message)
        ack(true)
      } else {
        ack(this.addPendingMessage(senderSocket, message, params))
      }
      Logger.separator()
    } else {
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
  }

  verifyMessage (senderSocket, message, params) {
    if (senderSocket.service) {
      return params.to && message.length <= maximumMessagesLength
    }
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

  findReceiverForServiceChannel (senderSocket, to) {
    const clientsForQueue = this.clients[senderSocket.channelId] || []
    const receivers = clientsForQueue.filter(c => {
      return c.clientId === to && senderSocket.channelId === c.channelId
    })
    return receivers.length === 1 ? receivers[0] : undefined
  }

  addPendingMessage (senderSocket, message, params) {
    const channelId = senderSocket.channelId
    const clientId = senderSocket.clientId
    Logger.logInfo(`adding pending message on channel ${senderSocket.channelId}`)
    const pendingMessages = this.pendingMessages.get(channelId) || []
    if (pendingMessages.length === maximumQueueSize) {
      Logger.logError('too many pending messagess')
      return new ServerError('too many pending messagess')
    }
    Logger.logMessage(`{ sender: ${clientId},  message: ${message} }`)
    if (senderSocket.service) {
      pendingMessages.push({
        message,
        clientId,
        params
      })
    } else {
      pendingMessages.push({
        message,
        clientId
      })
    }
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
