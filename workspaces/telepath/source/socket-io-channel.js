import base64url from 'base64url'
import timeoutCallback from 'timeout-callback'

class SocketIOChannel {
  pendingMessages = []

  setupDone = false

  socketFactoryMethod

  channelId

  service

  onMessage

  onError

  timeout

  constructor ({ clientId, socketFactoryMethod }) {
    this.clientId = clientId
    this.socketFactoryMethod = socketFactoryMethod
    this.socket = this.socketFactoryMethod()
  }

  async start ({ channelId, service, onMessage, onError, timeout = 30000 }) {
    this.channelId = channelId
    this.onMessage = onMessage
    this.onError = onError
    this.timeout = timeout
    this.service = service
    await this.waitUntilConnected(timeout)
    this.installEventHandlers({ onMessage, onError })
    await this.identify({ channelId, timeout, service })
    this.setupDone = true
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

  identify ({ channelId, timeout, service }) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'identify',
        { channelId, clientId: this.clientId, service },
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
    this.socket.on('disconnect', async reason => {
      this.setupDone = false
      if (reason === 'io server disconnect') {
        console.log('server disconnected - trying to reconnect...')
        try {
          await this.start({
            channelId: this.channelId,
            onMessage: this.onMessage,
            onError: this.onError,
            timeout: this.timeout
          })
        } catch (e) {
          console.log('error reconnecting:', e)
          onError && onError(e)
        }
      } else {
        console.log('disconnected - trying to reconnect...')
      }
    })
    this.socket.on('reconnect', async () => {
      console.log('reconnected')
      try {
        await this.identify({
          channelId: this.channelId,
          timeout: this.timeout,
          service: this.service
        })
        this.setupDone = true
      } catch (e) {
        console.log('could not re-identify when reconnecting:', e)
        this.onError && this.onError(e)
      }
    })
    this.socket.on('message', message => {
      onMessage(base64url.toBuffer(message))
    })
    if (onError) {
      this.socket.on('error', onError)
    }
  }

  emitMessage (message, params = {}, timeout = 30000) {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'message',
        message,
        params,
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

  async emit (data, params) {
    if (this.setupDone) {
      const message = base64url.encode(data)
      await this.emitMessage(message, params)
    } else {
      throw new Error('Please wait for subscribe call to finish before emitting messages!')
    }
  }
}

export { SocketIOChannel }
