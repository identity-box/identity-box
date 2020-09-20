class Tunnel {
  socketIO
  socketSender
  socketReceiver
  tunnel
  tunnelUrl
  onTunnelEnded

  constructor ({ tunnelId, socketIO }, onTunnelEnded) {
    this.tunnelUrl = `/${tunnelId}`
    this.socketIO = socketIO
    this.onTunnelEnded = onTunnelEnded
    this.start()
  }

  verifyTunnel = socket => {
    if (!this.socketSender) {
      console.log('SENDER')
      this.socketSender = socket
    } else if (!this.socketReceiver) {
      if (this.tunnelIdFromSocket(this.socketSender) === this.tunnelIdFromSocket(socket)) {
        console.log('RECEIVER')
        this.socketReceiver = socket
      } else {
        throw new Error('The sockets at both ends of the tunnel are not having the same tunnel id!')
      }
    } else {
      throw new Error('The sockets at both ends of the tunnel are not having the same tunnel id!')
    }
  }

  onConnection = socket => {
    console.log(`connection from socket with id: ${socket.id}`)
    try {
      this.verifyTunnel(socket)
      socket.on('message', msg => {
        this.onMessage(socket, msg)
      })
      socket.on('end', () => {
        this.endTunnel(socket)
      })
      socket.on('disconnect', reason => {
        console.log('Session disconnected:', socket.id, reason)
      })
    } catch (e) {
      console.log(e.msg)
      this.endTunnel()
    }
  }

  tunnelIdFromSocket = socket => {
    // socket id has the form of /mnyiWEL4AbBJWUkpnIfc-k4hgHFOdnz8JHyjNDOTpG4#HxDrrxGFfCSa8YgHAAAB
    // we first split on "#" and then ignore leading slash
    return socket.id.split('#')[0].slice(1)
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

  start = () => {
    this.tunnel = this.socketIO.of(this.tunnelUrl)
      .on('connection', this.onConnection)
  }

  endTunnel = socket => {
    console.log('endTunnel from:', socket.id)
    this.tunnel.emit('end')
    this.tunnel.removeAllListeners()
    this.socketReceiver = undefined
    this.socketSender = undefined
    this.onTunnelEnded && this.onTunnelEnded()
  }
}

export { Tunnel }
