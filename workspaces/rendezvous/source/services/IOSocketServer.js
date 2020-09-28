import base64url from 'base64url'
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
    this.io.on('connection', socket => {
      console.log(`Connection from ${socket.id}`)
      socket.on('publicKey', async encodedPublicKey => {
        console.log('encodedPublicKey:', encodedPublicKey)
        const { publicKey } = JSON.parse(base64url.decode(encodedPublicKey))
        console.log('publicKey:', publicKey)

        const session = new Session({
          clientPublicKey: publicKey,
          socketIO: this.io,
          dispatcher: this.dispatcher
        }, () => {
          delete this.sessions[publicKey]
        })

        this.sessions[publicKey] = session
      })
      socket.on('tunnel', async tunnelId => {
        console.log('requested tunnel with id:', tunnelId)
        const tunnel = new Tunnel({
          tunnelId,
          socketIO: this.io
        }, () => {
          delete this.tunnels[tunnelId]
        })

        this.tunnels[tunnelId] = tunnel
        socket.emit('ready', `${tunnelId}`)
      })
      socket.on('disconnect', reason => {
        console.log(`Peer ${socket.id} disconnected (${reason})`)
      })
    })
  }
}

export { IOSocketServer }
