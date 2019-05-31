import { createCache } from './auto-pruning-cache'

export const maximumQueueSize = 10
export const maximumNotificationLength = 100000

export class SocketServer {
  constructor () {
    this.clients = []
    this.pendingNotifications = createCache()
  }

  onConnection (clientSocket) {
    clientSocket.on('identify', (queueId, ack) => {
      this.onIdentify(clientSocket, queueId)
      if (ack) {
        ack()
      }
    })
    clientSocket.on('notification', notification => {
      this.onNotification(clientSocket, notification)
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
    this.deliverPendingNotifications(clientSocket)
  }

  deliverPendingNotifications (clientSocket) {
    const queueId = clientSocket.queueId
    const pending = this.pendingNotifications.get(queueId)
    if (pending) {
      pending.map(notification => {
        clientSocket.emit('notification', notification)
      })
      this.pendingNotifications.del(queueId)
    }
  }

  onNotification (source, notification) {
    if (!this.verifyNotification(notification)) {
      source.emit('server error', 'notification too long')
      return
    }

    const receiver = this.findReceiver(source)
    if (receiver) {
      receiver.emit('notification', notification)
    } else {
      this.addPendingNotification(source, notification)
    }
  }

  verifyNotification (notification) {
    return notification.length <= maximumNotificationLength
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

  addPendingNotification (source, notification) {
    let queueId = source.queueId
    let pendingNotifications = this.pendingNotifications.get(queueId) || []
    if (pendingNotifications.length === maximumQueueSize) {
      source.emit('server error', 'too many pending notifications')
      return
    }

    pendingNotifications.push(notification)
    this.pendingNotifications.set(queueId, pendingNotifications)
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
