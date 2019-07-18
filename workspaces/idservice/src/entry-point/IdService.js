import path from 'path'
import { Telepath } from '../telepath'
import { IdentityProvider } from '../identity'

class IdService {
  identityProvider
  telepath
  subscription

  start = async () => {
    this.identityProvider = new IdentityProvider()
    this.telepath = await this.getTelepath()
    this.subscription = await this.telepath.subscribe(
      message => this.processMessage(message),
      error => {
        console.log('error: ' + error)
      }
    )

    process.on('SIGINT', this.stop)
  }

  stop = () => {
    console.log('\nUnsubscribing from telepath and exiting...')

    this.telepath.unsubscribe(this.subscription)

    process.exit(0)
  }

  getTelepath = async () => {
    const telepath = new Telepath({
      path: path.resolve(process.cwd(), 'telepath.config'),
      queuingServiceUrl: process.env.serviceUrl || 'https://idbox-queue.now.sh',
      baseUrl: 'https://idbox.now.sh'
    })
    telepath.describe()
    await telepath.printQRCodeOnTerminal()
    return telepath
  }

  createIdentity = async ({
    name,
    publicEncryptionKey,
    publicSigningKey
  }) => {
    console.log(`Creating identity with name "${name}"`)
    const identity = await this.identityProvider.createNew({
      name,
      publicEncryptionKey,
      publicSigningKey
    })
    return identity
  }

  respondWithIdentity = async identity => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'set_identity',
        params: [
          { identity }
        ]
      }
      await this.telepath.emit(response)
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithError = async error => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'set_identity',
        params: [
          { error: error.message }
        ]
      }
      await this.telepath.emit(response)
    } catch (e) {
      console.error(e.message)
    }
  }

  processMessage = async message => {
    if (this.messageSupported(message)) {
      try {
        const identity = await this.createIdentity(message.params[0])
        this.respondWithIdentity(identity)
      } catch (e) {
        console.error(e.message)
        this.respondWithError(e)
      }
    }
  }

  messageSupported = message => (message.method === 'create_identity' && message.params && message.params.length === 1)
}

export { IdService }
