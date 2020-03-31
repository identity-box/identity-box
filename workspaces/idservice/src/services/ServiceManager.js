import { ServiceProxy } from '@identity-box/utils'

class ServiceManager {
  serviceRegistry

  constructor ({ serviceRegistry }) {
    this.serviceRegistry = serviceRegistry
  }

  get = servicePath => {
    if (!this.serviceRegistry.isRegistred(servicePath)) {
      throw new Error(`Service ${servicePath} is not registered!`)
    }
    return new ServiceProxy(servicePath)
  }
}

export { ServiceManager }
