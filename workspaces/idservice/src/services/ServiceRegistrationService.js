import ipc from 'node-ipc'

class ServiceRegistrationService {
  ipc
  serviceRegistry

  start = () => {
    return new Promise(resolve => {
      this.ipc.serve(
        () => {
          resolve(this)
        }
      )
      this.addMessageHandler()
      this.ipc.server.start()
    })
  }

  stop = () => {
    this.ipc.server.stop()
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

  sendResponse = (socket, response) => {
    this.ipc.server.emit(
      socket,
      'message',
      {
        id: `${this.ipc.servicePath}`,
        status: 'SUCCESS',
        response
      }
    )
  }

  sendErrorResponse = (socket, message) => {
    this.ipc.server.emit(
      socket,
      'message',
      {
        id: `${this.ipc.servicePath}`,
        status: 'ERROR',
        response: {
          method: 'register-error',
          params: [
            { message }
          ]
        }
      }
    )
  }

  addMessageHandler = () => {
    this.ipc.server.on(
      'message',
      ({ method, params }, socket) => {
        if (method !== 'register') {
          this.sendErrorResponse(socket, 'RPC: unknown method')
        } else {
          const { servicePath } = params[0] || {}
          try {
            const response = this.register(servicePath)
            this.sendResponse(socket, response)
          } catch (e) {
            this.sendErrorResponse(socket, e.message)
          }
        }
      }
    )
  }

  validateServicePath = servicePath => {
    const [appspace, id] = servicePath.split('.')

    if (appspace === undefined || appspace.length === 0) {
      throw new Error('missing service name: the path should be in the format: service-namespace.service-name')
    }

    if (id === undefined || id.length === 0) {
      throw new Error('missing service name: the path should be in the format: service-namespace.service-name')
    }

    return { appspace, id }
  }

  constructor ({
    serviceRegistry,
    servicePath
  }) {
    const { appspace, id } = this.validateServicePath(servicePath)

    this.serviceRegistry = serviceRegistry
    this.serviceRegistry.register(servicePath)

    this.ipc = new ipc.IPC()
    this.ipc.config.silent = true
    this.ipc.config.appspace = `${appspace}.`
    this.ipc.config.id = id
    this.ipc.servicePath = servicePath
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
