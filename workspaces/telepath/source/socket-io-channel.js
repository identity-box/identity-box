import base64url from 'base64url'
import timeoutCallback from 'timeout-callback'

export class SocketIOChannel {
  pendingMessages = []
  setupDone = false
  socketFactoryMethod

  constructor (socketFactoryMethod) {
    this.socketFactoryMethod = socketFactoryMethod
  }

  async start ({ channelId, onMessage, onError, timeout = 30000 }) {
    this.socket = this.socketFactoryMethod()
    await this.waitUntilConnected()
    await this.identify({ channelId, timeout })
    this.installEventHandlers({ onMessage, onError })
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
            this.sendPendingMessages()
            resolve()
          }
        })
      )
    })
  }

  installEventHandlers ({ onMessage, onError }) {
    this.socket.on('message', message => {
      onMessage(base64url.toBuffer(message))
    })
    if (onError) {
      this.socket.on('error', onError)
      this.socket.on('server error', onError)
    }
  }

  emit (data) {
    const message = base64url.encode(data)
    if (this.setupDone) {
      this.socket.emit('message', message)
    } else {
      this.pendingMessages.push(message)
    }
  }

  sendPendingMessages () {
    this.pendingMessages.forEach(message => {
      this.socket.emit('message', message)
    })
    this.pendingMessages = []
    this.setupDone = true
  }
}
