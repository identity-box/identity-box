import path from 'path'
import { TypedArrays } from '@react-frontend-developer/buffers'
import { Telepath } from '../telepath'
import { IdentityProvider, createDIDDocument } from '../identity'
import { IPNSFirebase } from '../services'
import base64url from 'base64url'
import nacl from 'tweetnacl'

const supportedMessages = [
  'create_identity',
  'get-did-document',
  'store-json',
  'create-new-telepath-channel'
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
      message => this.processMessage(message, this.telepath),
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

  createRandomName = () => {
    const randomNameSize = 18
    const nameBytes = nacl.randomBytes(randomNameSize)
    const name = TypedArrays.uint8Array2string(nameBytes, 'hex')
    return base64url.encode(name)
  }

  respondWithIdentity = async (identity, telepath) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'set_identity',
        params: [
          { identity }
        ]
      }
      await telepath.emit(response)
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithDIDDocument = async (didDocument, telepath) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'set-did-document',
        params: [
          didDocument
        ]
      }
      await telepath.emit(response)
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithCID = async (cid, telepath) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'store-json-response',
        params: [
          { cid }
        ]
      }
      await telepath.emit(response)
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithTelepath = async (channelDescription, telepath) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'create-new-telepath-channel-response',
        params: [
          channelDescription
        ]
      }
      await telepath.emit(response)
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithError = async (error, telepath) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'set_identity',
        params: [
          { error: error.message }
        ]
      }
      await telepath.emit(response)
    } catch (e) {
      console.error(e.message)
    }
  }

  handleCreateIdentity = async (message, telepath) => {
    const identity = await this.createIdentity(message.params[0])
    this.respondWithIdentity(identity, telepath)
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

  handleGetDIDDocument = async (message, telepath) => {
    const { did } = message.params[0]
    const ipnsName = this.identityProvider.ipnsNameFromDID(did)
    const cid = await IPNSFirebase.getCIDForIPNSName({ ipnsName })
    const didDocument = await this.identityProvider.readFromIPFS(cid)
    this.respondWithDIDDocument(didDocument, telepath)
  }

  handleStoreJSON = async (message, telepath) => {
    const json = message.params[0]
    const cid = await this.identityProvider.writeToIPFS(json)
    this.respondWithCID(cid, telepath)
  }

  handleCreateNewTelepathChannel = async () => {
    const telepath = new Telepath({
      queuingServiceUrl: process.env.serviceUrl || 'https://idbox-queue.now.sh',
      baseUrl: 'https://idbox.now.sh'
    })

    await telepath.connect()
    telepath.subscribe(
      message => this.processMessage(message, telepath),
      error => {
        console.log('error: ' + error)
      }
    )

    const { id, key } = telepath

    await this.respondWithTelepath({
      id,
      key: base64url.encode(key),
      appName: this.createRandomName()
    }, this.telepath)
  }

  processMessage = async (message, telepath) => {
    if (this.messageSupported(message)) {
      try {
        switch (message.method) {
          case 'create_identity':
            await this.handleCreateIdentity(message, telepath)
            break
          case 'get-did-document':
            await this.handleGetDIDDocument(message, telepath)
            break
          case 'store-json':
            await this.handleStoreJSON(message, telepath)
            break
          case 'create-new-telepath-channel':
            await this.handleCreateNewTelepathChannel(message, telepath)
            break
        }
      } catch (e) {
        console.error(e.message)
        this.respondWithError(e, telepath)
      }
    }
  }

  messageSupported = message => (supportedMessages.includes(message.method) && message.params && (message.params.length === 1 || message.method === 'create-new-telepath-channel'))
}

export { IdService }
