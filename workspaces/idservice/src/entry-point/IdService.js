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
  'get-json',
  'reset'
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
      baseUrl: 'https://idbox.online'
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

  respondWithIdentity = async (identity, to) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'set_identity',
        params: [
          { identity }
        ]
      }
      await this.telepath.emit(response, {
        to
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithDIDDocument = async (didDocument, to) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'get-did-document-response',
        params: [
          didDocument
        ]
      }
      await this.telepath.emit(response, {
        to
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithCID = async (cid, to) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'store-json-response',
        params: [
          { cid }
        ]
      }
      await this.telepath.emit(response, {
        to
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithJSON = async (json, to) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'get-json-response',
        params: [
          { json }
        ]
      }
      await this.telepath.emit(response, {
        to
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  respond = async (method, to) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method,
        params: []
      }
      await this.telepath.emit(response, {
        to
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithError = async (error, to) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: 'set_identity',
        params: [
          { error: error.message }
        ]
      }
      await this.telepath.emit(response, {
        to
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  handleCreateIdentity = async message => {
    const identity = await this.createIdentity(message.params[0])
    this.respondWithIdentity(identity, message.params[1].from)
    const didDoc = createDIDDocument({
      ...identity,
      ...message.params[0]
    })
    const cid = await this.identityProvider.writeToIPFS(didDoc)
    await this.identityProvider.pin(cid)
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
    this.respondWithDIDDocument(didDocument, message.params[1].from)
  }

  handleStoreJSON = async message => {
    const json = message.params[0]
    const cid = await this.identityProvider.writeToIPFS(json)
    await this.identityProvider.pin(cid)
    this.respondWithCID(cid, message.params[1].from)
  }

  handleGetJSON = async message => {
    const { cid } = message.params[0]
    const { json } = await this.identityProvider.readFromIPFS(cid)
    this.respondWithJSON(json, message.params[1].from)
  }

  handleReset = async message => {
    await this.identityProvider.deleteAll()
    this.respond('reset-response', message.params[1].from)
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
          case 'store-json':
            await this.handleStoreJSON(message)
            break
          case 'get-json':
            await this.handleGetJSON(message)
            break
          case 'reset':
            await this.handleReset(message)
            break
        }
      } catch (e) {
        console.error(e.message)
        this.respondWithError(e)
      }
    }
  }

  messageSupported = message => (supportedMessages.includes(message.method) && message.params && message.params.length === 2)
}

export { IdService }
