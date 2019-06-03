import base64url from 'base64url'
import timeoutCallback from 'timeout-callback'

export class SocketIOChannel {
  constructor (socketFactoryMethod) {
    this.socketFactoryMethod = socketFactoryMethod
    this.pendingNotifications = []
    this.setupDone = false
  }

  async start ({ channelId, onNotification, onError, timeout = 30000 }) {
    this.socket = this.socketFactoryMethod()
    await this.waitUntilConnected()
    await this.identify({ channelId, timeout })
    this.installEventHandlers({ onNotification, onError })
  }

  waitUntilConnected () {
    return new Promise((resolve, reject) => {
      if (this.socket.connected) {
        this.socket.off()
        resolve()
      } else {
        this.socket.on('connect', () => {
          this.socket.off('connect')
          resolve()
        })
        this.socket.connect()
      }
    })
  }

  identify ({ channelId, timeout }) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'identify',
        channelId,
        timeoutCallback(timeout, e => {
          if (e instanceof Error) {
            reject(e)
          } else {
            this.sendPendingNotifications()
            resolve()
          }
        })
      )
    })
  }

  installEventHandlers ({ onNotification, onError }) {
    this.socket.on('notification', message => {
      onNotification(base64url.toBuffer(message))
    })
    if (onError) {
      this.socket.on('error', onError)
      this.socket.on('server error', onError)
    }
  }

  notify (data) {
    const message = base64url.encode(data)
    if (this.setupDone) {
      this.socket.emit('notification', message)
    } else {
      this.pendingNotifications.push(message)
    }
  }

  sendPendingNotifications () {
    this.pendingNotifications.forEach(message => {
      this.socket.emit('notification', message)
    })
    this.pendingNotifications = []
    this.setupDone = true
  }
}
