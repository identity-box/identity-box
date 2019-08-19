import path from 'path'
import { Telepath } from '../telepath'
import { IdentityProvider, createDIDDocument } from '../identity'
import { IPNSFirebase } from '../services'

const supportedMessages = [
  'create_identity',
  'get-did-document'
]

class IdService {
  identityProvider

  telepath

  subscription

  start = async () => {
    IPNSFirebase.connect()
    this.identityProvider = new IdentityProvider()
    this.telepath = await this.getTelepath()
    await this.telepath.connect()
    this.subscription = this.telepath.subscribe(
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

  respondWithDIDDocument = async didDocument => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'set-did-document',
        params: [
          didDocument
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

  handleCreateIdentity = async message => {
    const identity = await this.createIdentity(message.params[0])
    this.respondWithIdentity(identity)
    const didDoc = createDIDDocument({
      ...identity,
      ...message.params[0]
    })
    const cid = await this.identityProvider.writeToIPFS(didDoc)
    console.log('cid:', cid)
    const ipnsName = this.identityProvider.ipnsNameFromDID(identity.did)
    console.log('ipns name:', ipnsName)
    await IPNSFirebase.setIPNSRecord({
      ipnsName,
      cid
    })
  }

  handleGetDIDDocument = async message => {
    const { did } = message.params[0]
    const ipnsName = this.identityProvider.ipnsNameFromDID(did)
    const cid = await IPNSFirebase.getCIDForIPNSName({ ipnsName })
    const didDocument = await this.identityProvider.readFromIPFS(cid)
    this.respondWithDIDDocument(didDocument)
  }

  processMessage = async message => {
    if (this.messageSupported(message)) {
      try {
        switch (message.method) {
          case 'create_identity':
            await this.handleCreateIdentity(message)
            break
          case 'get-did-document':
            await this.handleGetDIDDocument(message)
            break
        }
      } catch (e) {
        console.error(e.message)
        this.respondWithError(e)
      }
    }
  }

  messageSupported = message => (supportedMessages.includes(message.method) && message.params && message.params.length === 1)
}

export { IdService }
