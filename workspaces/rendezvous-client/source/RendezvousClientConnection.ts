import { RendezvousClientSession } from './RendezvousClientSession'

import type { RendezvousMessage } from './RendezvousMessage'

type RendezvousClientConnectionDescriptor = {
  baseUrl: string
  onMessage?: (msg: RendezvousMessage) => void
  onSessionEnded?: (reason: string) => void
  prng?: (byteCount: number) => Promise<Uint8Array>
}

class RendezvousClientConnection {
  session?: RendezvousClientSession
  baseUrl
  onMessage
  onSessionEnded
  prng

  constructor({
    baseUrl,
    onMessage,
    onSessionEnded,
    prng
  }: RendezvousClientConnectionDescriptor) {
    this.baseUrl = baseUrl
    this.onMessage = onMessage
    this.onSessionEnded = onSessionEnded
    this.prng = prng
  }

  create: () => Promise<void> = async () => {
    return new Promise((resolve, reject) => {
      try {
        this.session = new RendezvousClientSession({
          baseUrl: this.baseUrl,
          onMessage: this.onMessage,
          onSessionEnded: this.onSessionEnded,
          prng: this.prng
        })
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  end = () => {
    this.session?.end()
  }

  send = async (msg: RendezvousMessage) => {
    return this.session?.send(msg)
  }
}

export { RendezvousClientConnection }
