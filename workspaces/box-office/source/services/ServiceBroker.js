import { ServiceManager } from './ServiceManager'

class ServiceBroker {
  serviceManager

  constructor ({ serviceManager }) {
    this.serviceManager = serviceManager
  }

  dispatch = async request => {
    const serviceProxy = this.serviceManager.get(request.servicePath)
    const response = await serviceProxy.send(request)

    return response.response
  }

  static __instance

  static getInstance = () => {
    if (!this.__instance) {
      this.__instance = new ServiceBroker({
        serviceManager: ServiceManager.getInstance()
      })
    }
    return this.__instance
  }
}

export { ServiceBroker }
