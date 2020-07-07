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
      socket.on('publicKey', async encodedPublicKey => {
        console.log('encodedPublicKey:', encodedPublicKey)
        const { publicKey } = JSON.parse(base64url.decode(encodedPublicKey))
        console.log('publicKey:', publicKey)

        this.session = this.io.of(`/${publicKey}`).on('connection', socket => {
          console.log('connection from ', publicKey)
          socket.emit('message', 'Ha Ha')
          this.session.removeAllListeners()
          // socket.disconnect(false)

          socket.on('disconnect', reason => {
            console.log('Peer on aaa disconnected:', reason)
          })
        })

        // const { response } = await this.dispatcher.dispatch(message)

        // ToDo: handle encryption/decryption...

        // socket.emit('message', base64url.encode(response))
        socket.emit('publicKey', publicKey)
      })
      socket.on('disconnect', reason => {
        console.log('Peer disconnected:', reason)
      })
    })
  }
}

export { IOSocketServer }
