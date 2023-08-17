import { RendezvousClientConnection } from './RendezvousClientConnection'

import { RendezvousMessage } from './RendezvousMessage'

type RendezvousClientDescriptor = {
  baseUrl: string
  onMessage?: (msg: RendezvousMessage) => void
  onSessionEnded?: (reason: string) => void
  prng?: (byteCount: number) => Promise<Uint8Array>
}

class RendezvousClient {
  baseUrl
  onMessage
  onSessionEnded
  prng

  constructor({
    baseUrl,
    onMessage,
    onSessionEnded,
    prng
  }: RendezvousClientDescriptor) {
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
