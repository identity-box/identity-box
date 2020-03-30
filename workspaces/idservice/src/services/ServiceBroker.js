class ServiceBroker {
  serviceManager

  constructor ({ serviceManager }) {
    this.serviceManager = serviceManager
  }

  dispatch = async request => {
    const serviceProxy = this.serviceManager.get(request.servicePath)
    const response = await serviceProxy.send(request)

    return {
      ...response.data,
      servicePath: request.servicePath
    }
  }
}

export { ServiceBroker }
