import base64url from 'base64url'
import timeoutCallback from 'timeout-callback'

export class SocketIOChannel {
  pendingMessages = []
  setupDone = false
  socketFactoryMethod

  constructor ({ clientId, socketFactoryMethod }) {
    this.clientId = clientId
    this.socketFactoryMethod = socketFactoryMethod
  }

  async start ({ channelId, onMessage, onError, timeout = 30000 }) {
    this.socket = this.socketFactoryMethod()
    await this.waitUntilConnected(timeout)
    this.installEventHandlers({ onMessage, onError })
    await this.identify({ channelId, timeout })
    await this.sendPendingMessages()
  }

  waitUntilConnected (timeout) {
    return new Promise((resolve, reject) => {
      if (this.socket.connected) {
        this.socket.off()
        resolve()
      } else {
        this.socket.on('connect', () => {
          this.socket.off('connect')
          clearTimeout(this.connectionTimer)
          resolve()
        })
        this.connectionTimer = setTimeout(() => {
          reject(new Error('connection timeout'))
        }, timeout)
        this.socket.connect()
      }
    })
  }

  identify ({ channelId, timeout }) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'identify',
        { channelId, clientId: this.clientId },
        timeoutCallback(timeout, (timeoutError, data) => {
          if (timeoutError) {
            reject(timeoutError)
          } else {
            if (data.error) {
              reject(new Error(data.error.message))
            } else {
              resolve(data)
            }
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
    }
  }

  emitMessage (message, timeout = 30000) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'message',
        message,
        timeoutCallback(timeout, (error, data) => {
          if (error) {
            reject(error)
          } else {
            if (data.error) {
              reject(new Error(data.error.message))
            } else {
              resolve(data)
            }
          }
        })
      )
    })
  }

  async emit (data) {
    const message = base64url.encode(data)
    if (this.setupDone) {
      await this.emitMessage(message)
    } else {
      this.pendingMessages.push(message)
    }
  }

  async sendPendingMessages () {
    const promises = this.pendingMessages.map(message => this.emitMessage(message))
    await Promise.all(promises)
    this.pendingMessages = []
    this.setupDone = true
  }
}
