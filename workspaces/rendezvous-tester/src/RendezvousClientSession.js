import io from 'socket.io-client'
import nacl from 'tweetnacl'
import base64url from 'base64url'

import { TypedArrays } from '@react-frontend-developer/buffers'

class RendezvousClientSession {
  baseUrl
  session
  sessionKey
  callback
  onSessionEnded
  theirSessionPublicKey

  constructor ({
    baseUrl,
    sessionKey,
    callback,
    onSessionEnded
  }) {
    this.baseUrl = baseUrl
    this.sessionKey = sessionKey
    this.callback = callback
    this.onSessionEnded = onSessionEnded
  }

  create = async () => {
    return new Promise((resolve, reject) => {
      try {
        const publicKey = base64url.encode(this.sessionKey.publicKey)

        this.session = io(`${this.baseUrl}/${publicKey}`)

        this.session.on('connect', () => {
          console.log('Established new session with Rendezvous service')
        })

        this.session.on('message', msg => {
          const { encryptedMessage, nonce } = JSON.parse(base64url.decode(msg))
          const response = this.decrypt(encryptedMessage, nonce)
          console.log('Encrypted response from Rendezvous service:', response)
          this.end()
          this.callback && this.callback(response)
        })

        this.session.on('publicKey', encodedPublicKey => {
          console.log('Received session public key from Rendezvous service:', encodedPublicKey)
          const { publicKey } = JSON.parse(base64url.decode(encodedPublicKey))
          console.log('Decoded session publicKey:', publicKey)

          this.theirSessionPublicKey = base64url.toBuffer(publicKey)

          resolve()
        })

        this.session.on('disconnect', reason => {
          this.onSessionEnded && this.onSessionEnded(reason)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  sendSessionPublicKey = socket => {
    const message = {
      publicKey: base64url.encode(this.sessionKey.publicKey)
    }

    socket.emit('publicKey', base64url.encode(JSON.stringify(message)))
  }

  end = () => {
    if (this.session && this.session.connected) {
      this.session.disconnect()
    } else {
      this.onSessionEnded && this.onSessionEnded('session end requested by the caller')
    }
  }

  encrypt = msg => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const nonceEncoded = base64url.encode(nonce)
    const msgJson = JSON.stringify(msg)
    const msgEncoded = base64url.encode(msgJson)
    const box = nacl.box(
      TypedArrays.string2Uint8Array(msgEncoded),
      nonce,
      this.theirSessionPublicKey,
      this.sessionKey.secretKey
    )
    const boxEncoded = base64url.encode(box)
    return base64url.encode(JSON.stringify({
      encryptedMessage: boxEncoded,
      nonce: nonceEncoded
    }))
  }

  decrypt = (encryptedMessage, encodedNonce) => {
    const box = base64url.toBuffer(encryptedMessage)
    const nonce = base64url.toBuffer(encodedNonce)
    const decryptedBox = nacl.box.open(box, nonce, this.theirSessionPublicKey, this.sessionKey.secretKey)
    const decryptedEncoded = TypedArrays.uint8Array2string(decryptedBox)
    return JSON.parse(base64url.decode(decryptedEncoded))
  }

  send = async msg => {
    await this.create()
    // encrypt message with session key
    const box = this.encrypt(msg)
    // and send it to the Rendezvous service
    this.session.emit('message', box)
  }
}

export { RendezvousClientSession }
