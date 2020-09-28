import base64url from 'base64url'
import nacl from 'tweetnacl'

import { TypedArrays } from '@react-frontend-developer/buffers'

class Session {
  socket
  socketIO
  clientPublicKey
  dispatcher
  session
  sessionKey
  sessionUrl
  onSessionEnded

  constructor ({ clientPublicKey, socketIO, dispatcher }, onSessionEnded) {
    this.sessionUrl = `/${clientPublicKey}`
    this.clientPublicKey = base64url.toBuffer(clientPublicKey)
    this.socketIO = socketIO
    this.dispatcher = dispatcher
    this.onSessionEnded = onSessionEnded
    this.start()
  }

  onConnection = socket => {
    this.socket = socket
    console.log('New session on ', this.sessionUrl)
    this.sendSessionKey()

    socket.on('message', this.onMessage)

    socket.on('disconnect', reason => {
      console.log('Peer on aaa disconnected:', reason)
    })
  }

  onMessage = async msg => {
    const { encryptedMessage, nonce } = JSON.parse(base64url.decode(msg))
    const decryptedMessage = this.decrypt(encryptedMessage, nonce)
    console.log('Received encrypted message from the client:', decryptedMessage)

    const response = await this.dispatcher.dispatch(decryptedMessage)
    const encryptedResponse = this.encrypt(response)

    this.sendResponse(encryptedResponse)
    this.endSession()
  }

  decrypt = (encryptedMessage, encodedNonce) => {
    const box = base64url.toBuffer(encryptedMessage)
    const nonce = base64url.toBuffer(encodedNonce)
    const decryptedBox = nacl.box.open(box, nonce, this.clientPublicKey, this.sessionKey.secretKey)
    const decryptedEncoded = TypedArrays.uint8Array2string(decryptedBox)
    return JSON.parse(base64url.decode(decryptedEncoded))
  }

  encrypt = msg => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const nonceEncoded = base64url.encode(nonce)
    const msgJson = JSON.stringify(msg)
    const msgEncoded = base64url.encode(msgJson)
    const box = nacl.box(
      TypedArrays.string2Uint8Array(msgEncoded),
      nonce,
      this.clientPublicKey,
      this.sessionKey.secretKey
    )
    const boxEncoded = base64url.encode(box)
    return base64url.encode(JSON.stringify({
      encryptedMessage: boxEncoded,
      nonce: nonceEncoded
    }))
  }

  sendSessionKey = () => {
    console.log('Creating session keypair...')
    this.sessionKey = nacl.box.keyPair()

    const publicKey = base64url.encode(this.sessionKey.publicKey)

    const message = {
      publicKey
    }

    this.socket.emit('publicKey', base64url.encode(JSON.stringify(message)))
  }

  sendResponse = response => {
    this.socket.emit('message', response)
  }

  start = () => {
    this.session = this.socketIO.of(this.sessionUrl)
      .on('connection', this.onConnection)
  }

  endSession = () => {
    console.log('ending session')
    this.session.removeAllListeners()
    this.onSessionEnded && this.onSessionEnded()
  }
}

export { Session }
