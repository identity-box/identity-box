import { ServiceProxy } from '@identity-box/utils'

class Dispatcher {
  serviceProxy
  servicePath

  constructor ({ servicePath }) {
    this.servicePath = servicePath
    this.serviceProxy = new ServiceProxy(this.servicePath)
  }

  dispatch = async message => {
    console.log('**!!** DISPATCHER **!!**')
    console.log('received:')
    console.log('message:', message)
    return this.serviceProxy.send(message)
  }
}

export { Dispatcher }
