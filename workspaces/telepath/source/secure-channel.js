import base64url from 'base64url'
import nacl from 'tweetnacl'

class SecureChannel {
  constructor ({ id, key, appName, socketIOChannel }) {
    this.socketIOChannel = socketIOChannel
    this.id = id
    this.key = key
    this.appName = appName
  }

  async startNotifications (notificationHandler, errorHandler) {
    this.notificationHandler = notificationHandler
    this.notificationErrorHandler = errorHandler
    await this.socketIOChannel.start({
      channelId: this.id,
      onNotification: data => this.onEncryptedNotification(data),
      onError: errorHandler
    })
  }

  notify = message => {
    const nonceAndCypherText = this.encrypt(message)
    this.socketIOChannel.notify(nonceAndCypherText)
  }

  onEncryptedNotification = data => {
    const message = this.decrypt(data)
    this.notificationHandler(message)
  }

  encrypt = message => {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
    // const plainText = new Uint8Array(Buffer.from(message))
    const cypherText = nacl.secretbox(message, nonce, this.key)
    return Buffer.concat([Buffer.from(nonce), Buffer.from(cypherText)])
  }

  decrypt = data => {
    const nonceAndCypherText = new Uint8Array(data)
    const nonce = nonceAndCypherText.slice(0, nacl.secretbox.nonceLength)
    const cypherText = nonceAndCypherText.slice(nacl.secretbox.nonceLength)
    return nacl.secretbox.open(cypherText, nonce, this.key)
  }

  createConnectUrl (baseUrl) {
    const encodedKey = base64url.encode(this.key)
    const encodedAppName = base64url.encode(this.appName)
    return `${baseUrl}/telepath/connect#I=${
      this.id
    }&E=${encodedKey}&A=${encodedAppName}`
  }
}

export { SecureChannel }
