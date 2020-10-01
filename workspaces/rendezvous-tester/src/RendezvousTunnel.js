import io from 'socket.io-client'
import nacl from 'tweetnacl'
import base64url from 'base64url'

class RendezvousTunnel {
  baseUrl
  tunnel
  tunnelId
  sessionKey
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
  }

  createNew = async () => {
    return new Promise((resolve, reject) => {
      try {
        this.createSessionKey()
        const tunnelId = `tunnel-${base64url.encode(this.sessionKey.publicKey)}`

        this.setupTunnel(tunnelId)

        this.tunnel.on('connect', () => {
          console.log('Connected to a new tunnel with Rendezvous service')
          console.log('tunnelId: ', tunnelId)
          resolve(tunnelId)
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  connectToExisting = async tunnelId => {
    return new Promise((resolve, reject) => {
      try {
        this.setupTunnel(tunnelId)
        this.tunnel.on('connect', () => {
          console.log('Connected to a Rendezvous service tunnel')
          console.log('tunnelId: ', tunnelId)
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

  onReady = () => {
    console.log('the other end of the tunnel got connected')
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

  createSessionKey = () => {
    this.sessionKey = nacl.box.keyPair()
  }
}

export { RendezvousTunnel }
