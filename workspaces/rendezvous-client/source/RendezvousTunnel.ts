import { io, Socket } from 'socket.io-client'
import base64url from 'base64url'

import type { RendezvousMessage } from './RendezvousMessage'

import { Cryptographer } from './Cryptographer'

interface ServerToClientEvents {
  connect: () => void
  publicKey: (encodedPublicKey: string) => void
  message: (msg: string) => void
  ready: (encodedPublicKey: string) => void
  'not-ready': () => void
  disconnect: () => void
  end: () => void
}

interface ClientToServerEvents {
  publicKey: (encodedPublicKey: string) => void
  message: (box: string) => void
  end: () => void
}

type RendezvousTunnelDescriptor = {
  baseUrl: string
  onMessage?: (msg: RendezvousMessage) => void
  onTunnelReady?: () => void
  onTunnelClosed?: () => void
  onOtherEndNotReady?: () => void
  prng?: (byteCount: number) => Promise<Uint8Array>
}

class RendezvousTunnel {
  baseUrl: string
  tunnel?: Socket<ServerToClientEvents, ClientToServerEvents>
  cryptographer: Cryptographer
  onMessage
  onTunnelReady
  onTunnelClosed
  onOtherEndNotReady
  prng

  constructor({
    baseUrl,
    onMessage,
    onTunnelReady,
    onTunnelClosed,
    onOtherEndNotReady,
    prng
  }: RendezvousTunnelDescriptor) {
    this.baseUrl = baseUrl
    this.onMessage = onMessage
    this.onTunnelReady = onTunnelReady
    this.onTunnelClosed = onTunnelClosed
    this.onOtherEndNotReady = onOtherEndNotReady
    this.prng = prng
    this.cryptographer = new Cryptographer(this.prng)
  }

  createNew = async () => {
    this.cryptographer = new Cryptographer(this.prng)
    await this.cryptographer.generateKeyPair()
    return new Promise((resolve, reject) => {
      try {
        if (!this.cryptographer.myPublicKey) {
          throw new Error(
            'fatal error: cryptographer.myPublicKey is undefined!'
          )
        }
        const tunnelId = `tunnel-${base64url.encode(
          Buffer.from(this.cryptographer.myPublicKey)
        )}`

        this.setupTunnel(tunnelId)

        this.tunnel?.on('connect', () => {
          console.log('Connected to a new tunnel with Rendezvous service')
          console.log('tunnelId: ', tunnelId)
          resolve({
            tunnelId,
            tunnelUrl: `${this.baseUrl}/${tunnelId}`
          })
        })
        this.tunnel?.on('publicKey', (encodedPublicKey) => {
          this.cryptographer.theirPublicKey =
            base64url.toBuffer(encodedPublicKey)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  encodedKeyFromTunnelId = (tunnelId: string) => {
    // strip "tunnel-" from tunnelId to get the public key
    return tunnelId.slice(7)
  }

  connectToExisting = async (tunnelId: string) => {
    this.cryptographer = new Cryptographer(this.prng)
    await this.cryptographer.generateKeyPair()
    return new Promise((resolve, reject) => {
      try {
        this.cryptographer.theirPublicKey = base64url.toBuffer(
          this.encodedKeyFromTunnelId(tunnelId)
        )
        this.setupTunnel(tunnelId)
        if (!this.tunnel) {
          throw new Error('fatal error: this.tunnel is undefined!')
        }
        this.tunnel.on('connect', () => {
          console.log('Connected to a Rendezvous service tunnel')
          console.log('tunnelId: ', tunnelId)
          if (!this.tunnel || !this.cryptographer.myPublicKey) {
            throw new Error(
              'fatal error: cryptographer.myPublicKey is undefined!'
            )
          }
          this.tunnel.emit(
            'publicKey',
            base64url.encode(Buffer.from(this.cryptographer.myPublicKey))
          )
          resolve({
            tunnelId,
            tunnelUrl: `${this.baseUrl}/${tunnelId}`
          })
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  setupTunnel = (tunnelId: string) => {
    this.tunnel = io(`${this.baseUrl}/${tunnelId}`)
    this.tunnel.on('message', this.onMessageHandler)
    this.tunnel.on('ready', this.onReady)
    this.tunnel.on('not-ready', this.onNotReady)
    this.tunnel.on('disconnect', this.onDisconnect)
    this.tunnel.on('end', this.onEnd)
  }

  onMessageHandler = (msg: string) => {
    try {
      const decryptedMessage = this.cryptographer.decrypt(msg)
      if (!decryptedMessage) {
        throw new Error(
          'fatal error: Rendezvous Tunnel: cannot decrypt message!'
        )
      }
      this.onMessage && this.onMessage(decryptedMessage)
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.onMessage &&
          this.onMessage({
            method: 'tunnel-message-decrypt-error',
            params: [
              {
                errorID: e.message
              }
            ]
          })
      } else {
        this.onMessage &&
          this.onMessage({
            method: 'tunnel-message-decrypt-error',
            params: [
              {
                errorID: 'unknown error!'
              }
            ]
          })
      }
    }
  }

  onReady = (encodedPublicKey: string) => {
    console.log('the other end of the tunnel got connected')
    if (encodedPublicKey) {
      console.log('encodedPublicKey=', encodedPublicKey)
      this.cryptographer.theirPublicKey = base64url.toBuffer(encodedPublicKey)
    }
    this.onTunnelReady && this.onTunnelReady()
  }

  onNotReady = () => {
    console.log('the other end of the tunnel got disconnected')
    this.onOtherEndNotReady && this.onOtherEndNotReady()
  }

  onDisconnect = (reason: string) => {
    console.log('Session disconnected:', reason)
    this.onTunnelClosed && this.onTunnelClosed()
  }

  onEnd = () => {
    this.tunnel?.connected && this.tunnel.disconnect()
  }

  send = async (msg: RendezvousMessage) => {
    const box = await this.cryptographer.encrypt(msg)
    this.tunnel?.emit('message', box)
  }

  closeTunnel = () => {
    this.tunnel?.connected && this.tunnel.emit('end')
  }

  closeLocalConnection = () => {
    this.tunnel?.connected && this.tunnel.disconnect()
  }
}

export { RendezvousTunnel }
export type { RendezvousMessage }
