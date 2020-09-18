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
    console.log('received message:', message)
    const { response } = await this.serviceProxy.send(message)
    return response
  }
}

export { Dispatcher }
