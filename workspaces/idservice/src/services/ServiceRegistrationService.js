import { Service } from '@identity-box/utils'
import { ServiceRegistry } from './ServiceRegistry'

class ServiceRegistrationService {
  serviceRegistry
  service

  start = async () => {
    this.service = await Service.create({
      servicePath: this.servicePath,
      onMessage: this.onMessage
    })
  }

  stop = () => {
    this.service && this.service.stop()
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

  static __instance

  static start = async () => {
    if (!this.__instance) {
      this.__instance = await this.create({
        serviceRegistry: ServiceRegistry.getInstance(),
        servicePath: 'identity-box.service-registration'
      })
    }
  }

  static create = async ({
    servicePath,
    serviceRegistry
  }) => {
    const service = new ServiceRegistrationService({
      serviceRegistry,
      servicePath
    })

    await service.start()

    return service
  }
}

export { ServiceRegistrationService }
