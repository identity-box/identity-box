import { Service } from '@identity-box/utils'

class IdentityService {
  serviceRegistry

  start = () => {
    return Service.create({
      servicePath: this.servicePath,
      onMessage: this.onMessage
    })
  }

  onMessage = ({ method, params }) => {
    try {
      return this.dispatcher.dispatch({
        method,
        params
      })
    } catch (e) {
      return this.errorResponse(method, e.message)
    }
  }

  errorResponse = (method, message) => ({
    method: `${method}-error`,
    params: [
      { message }
    ]
  })

  constructor ({
    servicePath,
    dispatcher
  }) {
    this.servicePath = servicePath
    this.dispatcher = dispatcher
  }

  static create = ({
    servicePath,
    dispatcher
  }) => {
    if (!dispatcher) {
      throw new Error("Can't do anything without Dispatcher instance!")
    }
    const server = new IdentityService({
      servicePath,
      dispatcher
    })

    return server.start()
  }
}

export { IdentityService }
