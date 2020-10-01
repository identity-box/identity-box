import nacl from 'tweetnacl'

import { RendezvousClientSession } from './RendezvousClientSession'

class RendezvousClientConnection {
  connection
  session
  sessionKey
  baseUrl
  callback

  constructor ({ baseUrl, callback }) {
    this.baseUrl = baseUrl
    this.callback = callback
  }

  create = async () => {
    return new Promise((resolve, reject) => {
      try {
        this.sessionKey = this.createSessionKey()
        this.session = new RendezvousClientSession({
          baseUrl: this.baseUrl,
          sessionKey: this.sessionKey,
          callback: this.callback
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

  createSessionKey = () => {
    return nacl.box.keyPair()
  }
}

export { RendezvousClientConnection }
