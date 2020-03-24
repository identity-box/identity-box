class Service {
  send = rpcObject => {
    return {
      status: 'SUCCESS',
      data: {
        responseMessage: 'hello world'
      }
    }
  }
}

class ServiceManager {
  get = servicePath => {
    return new Service()
  }
}

export { ServiceManager }
