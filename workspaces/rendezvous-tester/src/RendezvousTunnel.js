import io from 'socket.io-client'
import base64url from 'base64url'

import { Cryptographer } from './Cryptographer'

class RendezvousTunnel {
  baseUrl
  tunnel
  cryptographer
  onMessage
  onTunnelReady
  onTunnelClosed
  onOtherEndNotReady

  constructor ({ baseUrl, onMessage, onTunnelReady, onTunnelClosed, onOtherEndNotReady }) {
    this.baseUrl = baseUrl
    this.onMessage = onMessage
    this.onTunnelReady = onTunnelReady
    this.onTunnelClosed = onTunnelClosed
    this.onOtherEndNotReady = onOtherEndNotReady
    this.cryptographer = new Cryptographer()
  }

  createNew = async () => {
    return new Promise((resolve, reject) => {
      try {
        const tunnelId = `tunnel-${base64url.encode(this.cryptographer.myPublicKey)}`

        this.setupTunnel(tunnelId)

        this.tunnel.on('connect', () => {
          console.log('Connected to a new tunnel with Rendezvous service')
          console.log('tunnelId: ', tunnelId)
          resolve(tunnelId)
        })
        this.tunnel.on('publicKey', encodedPublicKey => {
          this.cryptographer.theirPublicKey = base64url.toBuffer(encodedPublicKey)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  encodedKeyFromTunnelId = tunnelId => {
    // strip "tunnel-" from tunnelId to get the public key
    return tunnelId.slice(7)
  }

  connectToExisting = async tunnelId => {
    return new Promise((resolve, reject) => {
      try {
        this.cryptographer.theirPublicKey = base64url.toBuffer(
          this.encodedKeyFromTunnelId(tunnelId)
        )
        this.setupTunnel(tunnelId)
        this.tunnel.on('connect', () => {
          console.log('Connected to a Rendezvous service tunnel')
          console.log('tunnelId: ', tunnelId)
          this.tunnel.emit('publicKey',
            base64url.encode(this.cryptographer.myPublicKey)
          )
          resolve(tunnelId)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  setupTunnel = (tunnelId) => {
    this.tunnel = io(`${this.baseUrl}/${tunnelId}`)
    this.tunnel.on('message', this.onMessageHandler)
    this.tunnel.on('ready', this.onReady)
    this.tunnel.on('not-ready', this.onNotReady)
    this.tunnel.on('disconnect', this.onDisconnect)
    this.tunnel.on('end', this.onEnd)
  }

  onMessageHandler = msg => {
    this.onMessage && this.onMessage(msg)
  }

  onReady = encodedPublicKey => {
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

  onDisconnect = reason => {
    console.log('Session disconnected:', reason)
    this.onTunnelClosed && this.onTunnelClosed()
  }

  onEnd = () => {
    this.tunnel.connected && this.tunnel.disconnect()
  }

  send = msg => {
    this.tunnel.emit('message', msg)
  }

  closeTunnel = () => {
    this.tunnel.connected && this.tunnel.emit('end')
  }

  closeLocalConnection = () => {
    this.tunnel.connected && this.tunnel.disconnect()
  }
}

export { RendezvousTunnel }
