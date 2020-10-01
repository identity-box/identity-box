import { RendezvousClientConnection } from './RendezvousClientConnection'

class RendezvousClient {
  baseUrl
  onConnected
  connection

  constructor ({ baseUrl, callback }) {
    this.baseUrl = baseUrl
    this.callback = callback
  }

  connect = async () => {
    const connection = new RendezvousClientConnection({
      baseUrl: this.baseUrl,
      callback: this.callback
    })
    await connection.create()
    return connection
  }
}

export { RendezvousClient }
