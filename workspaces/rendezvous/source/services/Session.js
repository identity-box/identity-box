import base64url from 'base64url'
import nacl from 'tweetnacl'

class Session {
  socketIO
  clientPublicKey
  session

  constructor ({ clientPublicKey, socketIO }) {
    this.clientPublicKey = clientPublicKey
    this.socketIO = socketIO
    this.start()
  }

  onConnection = socket => {
    this.socket = socket
    console.log('New session on ', this.clientPublicKey)
    this.sendSessionKey()

    socket.on('message', this.onMessage)

    socket.on('disconnect', reason => {
      console.log('Peer on aaa disconnected:', reason)
    })
  }

  onMessage = msg => {
    console.log('Received encrypted message from the client:', msg)

    this.sendResponse('Encrypted response from Rendezvous service')

    this.endSession()
  }

  sendSessionKey = () => {
    console.log('Creating session keypair...')
    this.sessionKey = nacl.box.keyPair()

    const publicKey = base64url.encode(this.sessionKey.publicKey)

    const message = {
      publicKey
    }

    this.socket.emit('publicKey', base64url.encode(JSON.stringify(message)))
  }

  sendResponse = response => {
    this.socket.emit('message', response)
  }

  start = () => {
    this.session = this.socketIO.of(`/${this.clientPublicKey}`)
      .on('connection', this.onConnection)
  }

  endSession = () => {
    this.session.removeAllListeners()
    // socket.disconnect(false)
  }
}

export { Session }
