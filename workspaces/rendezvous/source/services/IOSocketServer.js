import base64url from 'base64url'

class IOSocketServer {
  io
  dispatcher

  constructor (io, dispatcher) {
    this.io = io
    this.dispatcher = dispatcher
  }

  setVerbose (status) {
    this.socketServer.setVerbose(status)
  }

  start () {
    this.io.on('connection', socket => {
      socket.on('message', async message => {
        console.log('message:', base64url.decode(message))

        const { response } = await this.dispatcher.dispatch(message)

        // ToDo: handle encryption/decryption...

        socket.emit('message', base64url.encode(response))
      })
      socket.on('disconnect', reason => {
        console.log('Peer disconnected:', reason)
      })
    })
  }
}

export { IOSocketServer }
