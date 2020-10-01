import io from 'socket.io-client'
import base64url from 'base64url'

import { Cryptographer } from './Cryptographer'

class RendezvousClientSession {
  baseUrl
  session
  callback
  onSessionEnded
  cryptographer

  constructor ({
    baseUrl,
    callback,
    onSessionEnded
  }) {
    this.baseUrl = baseUrl
    this.callback = callback
    this.onSessionEnded = onSessionEnded
    this.cryptographer = new Cryptographer()
  }

  create = async () => {
    return new Promise((resolve, reject) => {
      try {
        const publicKey = base64url.encode(this.cryptographer.myPublicKey)

        this.session = io(`${this.baseUrl}/${publicKey}`)

        this.session.on('connect', () => {
          console.log('Established new session with Rendezvous service')
        })

        this.session.on('message', msg => {
          const { encryptedMessage, nonce } = JSON.parse(base64url.decode(msg))
          const response = this.cryptographer.decrypt(encryptedMessage, nonce)
          console.log('Encrypted response from Rendezvous service:', response)
          this.end()
          this.callback && this.callback(response)
        })

        this.session.on('publicKey', encodedPublicKey => {
          console.log('Received session public key from Rendezvous service:', encodedPublicKey)
          const { publicKey } = JSON.parse(base64url.decode(encodedPublicKey))
          console.log('Decoded session publicKey:', publicKey)

          this.cryptographer.theirPublicKey = base64url.toBuffer(publicKey)

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
      publicKey: base64url.encode(this.cryptographer.myPublicKey)
    }

    socket.emit('publicKey', base64url.encode(JSON.stringify(message)))
  }

  end = () => {
    if (this.session && this.session.connected) {
      this.session.disconnect()
    } else {
      this.onSessionEnded && this.onSessionEnded('session already disconnected')
    }
  }

  send = async msg => {
    await this.create()
    // encrypt message with session key
    const box = this.cryptographer.encrypt(msg)
    // and send it to the Rendezvous service
    this.session.emit('message', box)
  }
}

export { RendezvousClientSession }
