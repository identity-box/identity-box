import { Session } from './Session'
import { Tunnel } from './Tunnel'

class IOSocketServer {
  io
  dispatcher
  sessions = {}
  tunnels = {}

  constructor (io, dispatcher) {
    this.io = io
    this.dispatcher = dispatcher
  }

  setVerbose (status) {
    this.socketServer.setVerbose(status)
  }

  start () {
    this.io.of(/^\/tunnel-[\w-]+$/).on('connection', socket => {
      const tunnelId = socket.nsp.name.slice(1)
      let tunnel = this.tunnels[tunnelId]

      if (!tunnel) {
        tunnel = new Tunnel({
          tunnelId,
          socket
        }, () => {
          delete this.tunnels[tunnelId]
        })
        this.tunnels[tunnelId] = tunnel
      } else {
        tunnel.addReceiver(socket)
      }
    })

    this.io.of(/^\/[\w-]+$/).on('connection', socket => {
      const sessionId = socket.nsp.name.slice(1)
      const session = new Session({
        socket,
        dispatcher: this.dispatcher
      }, () => {
        delete this.sessions[sessionId]
      })

      this.sessions[sessionId] = session
    })
  }
}

export { IOSocketServer }
