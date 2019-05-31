export default class FakeClientSocket {
  connect (socketServer) {
    this.eventHandlers = []
    this.outgoing = []
    this.socketServer = socketServer
    socketServer.onConnection(this)
  }

  receiveIncoming (event, message, ...args) {
    if (event === 'identify') {
      this.queueId = message
    }
    this.eventHandlers[event](message, ...args)
  }

  emit (event, payload) {
    this.outgoing.push({ event, payload })
  }

  on (event, callback) {
    this.eventHandlers[event] = callback
  }
}
