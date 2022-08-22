import { RendezvousClientConnection } from './RendezvousClientConnection.js'

class RendezvousClient {
  baseUrl
  onMessage
  onSessionEnded
  prng

  constructor ({ baseUrl, onMessage, onSessionEnded, prng }) {
    this.baseUrl = baseUrl
    this.onMessage = onMessage
    this.onSessionEnded = onSessionEnded
    this.prng = prng
  }

  connect = async () => {
    const connection = new RendezvousClientConnection({
      baseUrl: this.baseUrl,
      onMessage: this.onMessage,
      onSessionEnded: this.onSessionEnded,
      prng: this.prng
    })
    await connection.create()
    return connection
  }
}

export { RendezvousClient }
