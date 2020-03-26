import { Service } from './Service'

class ServiceManager {
  serviceRegistry

  constructor ({ serviceRegistry }) {
    this.serviceRegistry = serviceRegistry
  }

  get = servicePath => {
    if (!this.serviceRegistry.isRegistred(servicePath)) {
      throw new Error(`Service ${servicePath} is not registred!`)
    }
    return new Service(servicePath)
  }
}

export { ServiceManager }
