import ipfsClient from 'ipfs-http-client'
import { IdentityProvider } from './IdentityProvider'
import packageJSON from '../../package.json'

class Dispatcher {
  ipfs = ipfsClient(process.env.IPFS_ADDR || '/ip4/127.0.0.1/tcp/5001')
  identityProvider

  constructor () {
    this.identityProvider = new IdentityProvider(this.ipfs)
  }

  dispatch = async message => {
    console.log('**!!** DISPATCHER **!!**')
    console.log('received:')
    console.log('message:', message)
    switch (message.method) {
      case 'about':
        return {
          method: 'about-response',
          params: [
            {
              description: '@identity-box/identity-service',
              version: `${packageJSON.version}`
            }
          ]
        }
      case 'create-identity':
        return this.identityProvider.createIdentity(message)
      case 'get-did-document':
        return this.identityProvider.getDIDDocument(message)
      case 'store-json':
        return this.identityProvider.storeJSON(message)
      case 'get-json':
        return this.identityProvider.getJSON(message)
      case 'reset':
        return this.identityProvider.reset(message)
      case 'backup':
        return this.identityProvider.backup(message)
      case 'has-backup':
        return this.identityProvider.hasBackup()
      case 'restore':
        return this.identityProvider.restore(message)
      case 'delete':
        return this.identityProvider.deleteIdentity(message)
      case 'migrate':
        return this.identityProvider.migrate(message)
      default:
        return {
          method: 'unknown-method',
          params: []
        }
    }
  }
}

export { Dispatcher }
