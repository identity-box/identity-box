import { ServiceProxy } from './ServiceProxy'

class ServiceManager {
  serviceRegistry

  constructor ({ serviceRegistry }) {
    this.serviceRegistry = serviceRegistry
  }

  get = servicePath => {
    if (!this.serviceRegistry.isRegistred(servicePath)) {
      throw new Error(`Service ${servicePath} is not registred!`)
    }
    return new ServiceProxy(servicePath)
  }
}

export { ServiceManager }
