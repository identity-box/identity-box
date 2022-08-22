import { Service } from '@identity-box/utils'
import { ServiceBroker } from './ServiceBroker.js'

import packageJSON from '../../package.json' assert { type: 'json' }

class BoxOfficeService {
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

  processMessage = async message => {
    console.log('MESSAGE:', message)
    if (message.servicePath === 'identity-box.box-office' && message.method === 'about') {
      return {
        method: 'about-response',
        params: [
          {
            description: '@identity-box/box-office',
            version: `${packageJSON.version}`
          }
        ]
      }
    }
    try {
      return this.serviceBroker.dispatch(message)
    } catch (e) {
      return this.errorResponse(`${message.method}-error`, e.message)
    }
  }

  onMessage = message => {
    const { method, params } = message
    if (method === 'register') {
      const { servicePath } = params[0] || {}
      try {
        return this.register(servicePath)
      } catch (e) {
        return this.errorResponse('register-error', e.message)
      }
    } else {
      return this.processMessage(message)
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

  errorResponse = (method, message) => ({
    method,
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
    this.serviceBroker = ServiceBroker.getInstance()
  }

  static create = async ({
    servicePath,
    serviceRegistry
  }) => {
    const service = new BoxOfficeService({
      serviceRegistry,
      servicePath
    })

    await service.start()

    return service
  }
}

export { BoxOfficeService }
