import { io, Socket } from 'socket.io-client'
import base64url from 'base64url'

import type { RendezvousMessage } from './RendezvousMessage'

import { Cryptographer } from './Cryptographer'

interface ServerToClientEvents {
  connect: () => void
  publicKey: (encodedPublicKey: string) => void
  message: (msg: string) => void
  disconnect: (reason: string) => void
}

interface ClientToServerEvents {
  publicKey: (encodedPublicKey: string) => void
  message: (box: string) => void
}

type RendezvousClientSessionDescriptor = {
  baseUrl: string
  onMessage?: (msg: RendezvousMessage) => void
  onSessionEnded?: (reason: string) => void
  prng?: (byteCount: number) => Promise<Uint8Array>
}

class RendezvousClientSession {
  baseUrl: string
  session?: Socket<ServerToClientEvents, ClientToServerEvents>
  onMessage
  onSessionEnded
  cryptographer

  constructor({
    baseUrl,
    onMessage,
    onSessionEnded,
    prng
  }: RendezvousClientSessionDescriptor) {
    this.baseUrl = baseUrl
    this.onMessage = onMessage
    this.onSessionEnded = onSessionEnded
    this.cryptographer = new Cryptographer(prng)
  }

  create: () => Promise<void> = async () => {
    return new Promise((resolve, reject) => {
      try {
        if (!this.cryptographer.myPublicKey) {
          throw new Error(
            'fatal error: cryptographer.myPublicKey is undefined!'
          )
        }
        const publicKey = base64url.encode(
          Buffer.from(this.cryptographer.myPublicKey)
        )

        this.session = io(`${this.baseUrl}/${publicKey}`)

        this.session.on('connect', () => {
          console.log('Established new session with Rendezvous service')
        })

        this.session.on('message', (msg) => {
          const response = this.cryptographer.decrypt(msg)
          if (!response) {
            throw new Error('fatal error: could not decrypt message!')
          }
          console.log('Encrypted response from Rendezvous service:', response)
          this.end()
          this.onMessage && this.onMessage(response)
        })

        this.session.on('publicKey', (encodedPublicKey) => {
          console.log(
            'Received session public key from Rendezvous service:',
            encodedPublicKey
          )
          const { publicKey } = JSON.parse(base64url.decode(encodedPublicKey))
          console.log('Decoded session publicKey:', publicKey)

          this.cryptographer.theirPublicKey = base64url.toBuffer(publicKey)

          resolve()
        })

        this.session.on('disconnect', (reason) => {
          this.onSessionEnded && this.onSessionEnded(reason)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  sendSessionPublicKey = (
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
  ) => {
    if (!this.cryptographer.myPublicKey) {
      throw new Error('fatal error: cryptographer.myPublicKey is undefined!')
    }
    const message = {
      publicKey: base64url.encode(Buffer.from(this.cryptographer.myPublicKey))
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

  send = async (msg: RendezvousMessage) => {
    await this.cryptographer.generateKeyPair()
    await this.create()
    // encrypt message with session key
    const box = await this.cryptographer.encrypt(msg)
    // and send it to the Rendezvous service
    this.session?.emit('message', box)
  }
}

export { RendezvousClientSession }
