import base64url from 'base64url'
import { Session } from './Session'

class IOSocketServer {
  io
  dispatcher
  session

  constructor (io, dispatcher) {
    this.io = io
    this.dispatcher = dispatcher
  }

  setVerbose (status) {
    this.socketServer.setVerbose(status)
  }

  start () {
    this.io.on('connection', socket => {
      socket.on('publicKey', async encodedPublicKey => {
        console.log('encodedPublicKey:', encodedPublicKey)
        const { publicKey } = JSON.parse(base64url.decode(encodedPublicKey))
        console.log('publicKey:', publicKey)

        // ToDo: here - let's create an abstraction for a session and
        // have all exchenges to happen there
        this.session = new Session({
          clientPublicKey: publicKey,
          socketIO: this.io
        })

        // const { response } = await this.dispatcher.dispatch(message)

        // ToDo: handle encryption/decryption...

        // socket.emit('message', base64url.encode(response))
        // socket.emit('publicKey', publicKey)
      })
      socket.on('disconnect', reason => {
        console.log('Peer disconnected:', reason)
      })
    })
  }
}

export { IOSocketServer }
