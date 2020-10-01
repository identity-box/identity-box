import { RendezvousClientSession } from './RendezvousClientSession'

class RendezvousClientConnection {
  session
  baseUrl
  onMessage
  onSessionEnded

  constructor ({ baseUrl, onMessage, onSessionEnded }) {
    this.baseUrl = baseUrl
    this.onMessage = onMessage
    this.onSessionEnded = onSessionEnded
  }

  create = async () => {
    return new Promise((resolve, reject) => {
      try {
        this.session = new RendezvousClientSession({
          baseUrl: this.baseUrl,
          onMessage: this.onMessage,
          onSessionEnded: this.onSessionEnded
        })
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }

  end = () => {
    this.session.end()
  }

  send = async msg => {
    await this.session.send(msg)
  }
}

export { RendezvousClientConnection }
