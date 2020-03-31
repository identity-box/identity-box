import { Service } from '@identity-box/utils'

class ServiceRegistrationService {
  serviceRegistry

  start = () => {
    return Service.create({
      servicePath: this.servicePath,
      onMessage: this.onMessage
    })
  }

  onMessage = ({ method, params }) => {
    if (method !== 'register') {
      return this.errorResponse('RPC: unknown method')
    } else {
      const { servicePath } = params[0] || {}
      try {
        return this.register(servicePath)
      } catch (e) {
        return this.errorResponse(e.message)
      }
    }
  }

  register = servicePath => {
    this.serviceRegistry.register(servicePath)
    return {
      method: 'register-response',
      params: [
        { servicePath }
      ]
    }
  }

  errorResponse = message => ({
    method: 'register-error',
    params: [
      { message }
    ]
  })

  constructor ({
    serviceRegistry,
    servicePath
  }) {
    this.serviceRegistry = serviceRegistry
    this.servicePath = servicePath
  }

  static create = ({
    serviceRegistry,
    servicePath
  }) => {
    const server = new ServiceRegistrationService({
      serviceRegistry,
      servicePath
    })

    return server.start()
  }
}

export { ServiceRegistrationService }
