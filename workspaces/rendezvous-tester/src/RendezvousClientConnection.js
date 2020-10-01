import { RendezvousClientSession } from './RendezvousClientSession'

class RendezvousClientConnection {
  connection
  session
  baseUrl
  callback

  constructor ({ baseUrl, callback, onSessionEnded }) {
    this.baseUrl = baseUrl
    this.callback = callback
    this.onSessionEnded = onSessionEnded
  }

  create = async () => {
    return new Promise((resolve, reject) => {
      try {
        this.session = new RendezvousClientSession({
          baseUrl: this.baseUrl,
          callback: this.callback,
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
