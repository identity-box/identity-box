import { RendezvousClientConnection } from './RendezvousClientConnection'

class RendezvousClient {
  baseUrl
  onMessage
  onSessionEnded

  constructor ({ baseUrl, onMessage, onSessionEnded }) {
    this.baseUrl = baseUrl
    this.onMessage = onMessage
    this.onSessionEnded = onSessionEnded
  }

  connect = async () => {
    const connection = new RendezvousClientConnection({
      baseUrl: this.baseUrl,
      onMessage: this.onMessage,
      onSessionEnded: this.onSessionEnded
    })
    await connection.create()
    return connection
  }
}

export { RendezvousClient }
