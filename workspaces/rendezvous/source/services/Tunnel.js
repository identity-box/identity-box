class Tunnel {
  socketSender
  socketReceiver
  tunnel
  tunnelId
  onTunnelEnded

  constructor ({ tunnelId, socket }, onTunnelEnded) {
    this.tunnelId = tunnelId
    this.onTunnelEnded = onTunnelEnded
    this.tunnel = socket.nsp
    this.start(socket)
  }

  verifyTunnel = socket => {
    if (!this.socketSender) {
      console.log('SENDER')
      this.socketSender = socket
    } else if (!this.socketReceiver) {
      console.log('RECEIVER')
      this.socketReceiver = socket
      this.socketReceiver.on('publicKey', encodedPublicKey => {
        this.socketSender.emit('ready', encodedPublicKey)
        this.socketReceiver.emit('ready')
      })
    } else {
      throw new Error('Both ends are already connected!!!!')
    }
  }

  start = socket => {
    console.log(`namespace connection on socket ${socket.id} from namespace:`, socket.nsp.name)
    try {
      this.verifyTunnel(socket)
      socket.on('message', msg => {
        this.onMessage(socket, msg)
      })
      socket.on('end', () => {
        this.endTunnel(socket)
      })
      socket.on('disconnect', reason => {
        this.onDisconnect(reason, socket)
      })
    } catch (e) {
      console.log(e.message)
      this.endTunnel(socket)
    }
  }

  addReceiver = socket => {
    this.start(socket)
  }

  tunnelIdFromSocketId = id => {
    // socket id has the form of /tunnel-mnyiWEL4AbBJWUkpnIfc-k4hgHFOdnz8JHyjNDOTpG4#HxDrrxGFfCSa8YgHAAAB
    // we first split on "#" and then ignore leading slash
    return id.split('#')[0].slice(1)
  }

  onMessage = async (socket, msg) => {
    console.log(`received message from socket with is ${socket.id}: ${msg}`)
    // all but sender
    socket.broadcast.emit('message', msg)
    // only sender (represented by socket)
    // socket.emit('message', msg)
    // all connected to the chat message
    // this.tunnel.emit('message', msg)
  }

  endTunnel = socket => {
    console.log('endTunnel from:', socket.id)
    this.socketReceiver = undefined
    this.socketSender = undefined
    this.tunnel.removeAllListeners()
    this.tunnel.emit('end')
    this.onTunnelEnded && this.onTunnelEnded()
  }

  onDisconnect = (reason, socket) => {
    console.log('Session disconnected:', socket.id, reason)
    if (this.socketReceiver && socket.id === this.socketReceiver.id) {
      this.socketReceiver = undefined
      this.socketSender && this.socketSender.emit('not-ready')
    } else if (this.socketSender && socket.id === this.socketSender.id) {
      this.socketReceiver && this.socketReceiver.emit('end')
      this.socketReceiver = undefined
      this.socketServer = undefined
    }
  }
}

export { Tunnel }
