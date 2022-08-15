import { ServiceProxy } from '@identity-box/utils'
import { ServiceRegistry } from './ServiceRegistry.js'

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

  static __instance

  static getInstance = () => {
    if (!this.__instance) {
      this.__instance = new ServiceManager({
        serviceRegistry: ServiceRegistry.getInstance()
      })
    }
    return this.__instance
  }
}

export { ServiceManager }
