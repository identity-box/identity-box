import { create } from 'ipfs-http-client'

import { NamePublisher } from './NamePublisher.js'
import { NameResolver } from './NameResolver.js'
import packageJSON from '../../package.json' assert { type: 'json' }

class Dispatcher {
  ipfs = create(process.env.IPFS_ADDR || '/ip4/127.0.0.1/tcp/5001')
  namePublisher
  nameResolver

  constructor () {
    this.namePublisher = new NamePublisher(this.ipfs)
    this.nameResolver = new NameResolver(this.ipfs)
  }

  dispatch = message => {
    console.log('**!!** DISPATCHER **!!**')
    console.log('received:')
    console.log('message:', message)
    switch (message.method) {
      case 'about':
        return {
          method: 'about-response',
          params: [
            {
              description: '@identity-box/nameservice',
              version: `${packageJSON.version}`
            }
          ]
        }
      case 'publish-name':
        return this.namePublisher.publish(message.params[0])
      case 'unpublish-name':
        return this.namePublisher.unpublish(message.params[0])
      case 'resolve-name':
        return this.nameResolver.resolve(message.params[0])
      default:
        return {
          method: 'unknown-method',
          params: []
        }
    }
  }
}

export { Dispatcher }
