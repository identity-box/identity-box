import base64url from 'base64url'
import nacl from 'tweetnacl'

import { TypedArrays } from '@react-frontend-developer/buffers'

class Session {
  socket
  clientPublicKey
  dispatcher
  sessionKey
  sessionNamespace
  onSessionEnded

  constructor ({ socket, dispatcher }, onSessionEnded) {
    this.socket = socket
    this.dispatcher = dispatcher
    this.onSessionEnded = onSessionEnded
    this.sessionNamespace = socket.nsp.name
    this.clientPublicKey = base64url.toBuffer(this.sessionNamespace.slice(1))
    this.start()
  }

  start = () => {
    console.log(`namespace connection on socket ${this.socket.id} from namespace:`, this.sessionNamespace)
    this.sendSessionKey()

    this.socket.on('message', this.onMessage)

    this.socket.on('disconnect', reason => {
      console.log(`Namespace on ${this.sessionNamespace} disconnected (reason: ${reason})`)
    })
  }

  onMessage = async msg => {
    const decryptedMessage = this.decrypt(msg)
    console.log('Received encrypted message from the client:', decryptedMessage)

    const response = await this.dispatcher.dispatch(decryptedMessage)
    const encryptedResponse = this.encrypt(response)

    this.sendResponse(encryptedResponse)
    this.endSession()
  }

  decrypt = encodedBox => {
    const { encryptedMessage, encodedNonce } = JSON.parse(base64url.decode(encodedBox))
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
      encodedNonce: nonceEncoded
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

  endSession = () => {
    console.log('ending session')
    this.socket.removeAllListeners()
    this.onSessionEnded && this.onSessionEnded()
  }
}

export { Session }
