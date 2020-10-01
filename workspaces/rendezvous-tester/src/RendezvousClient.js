import { RendezvousClientConnection } from './RendezvousClientConnection'

class RendezvousClient {
  baseUrl
  onConnected
  connection

  constructor ({ baseUrl, callback, onSessionEnded }) {
    this.baseUrl = baseUrl
    this.callback = callback
    this.onSessionEnded = onSessionEnded
  }

  connect = async () => {
    const connection = new RendezvousClientConnection({
      baseUrl: this.baseUrl,
      callback: this.callback,
      onSessionEnded: this.onSessionEnded
    })
    await connection.create()
    return connection
  }
}

export { RendezvousClient }
