import ipc from 'node-ipc'

class Service {
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

  sendResponse = (socket, response) => {
    this.ipc.server.emit(
      socket,
      'message',
      {
        id: `${this.ipc.servicePath}`,
        response
      }
    )
  }

  sendErrorResponse = (socket, method, message) => {
    this.ipc.server.emit(
      socket,
      'message',
      {
        id: `${this.ipc.servicePath}`,
        response: {
          method: method ? `${method}-error` : 'rpc-error',
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
      async (message, socket) => {
        try {
          if (this.onMessage) {
            const response = await this.onMessage(message)
            this.sendResponse(socket, response)
          } else {
            this.sendErrorResponse(socket,
              message.method,
              'Service has no associated method handler!'
            )
          }
        } catch (e) {
          this.sendErrorResponse(socket, message.method, e.message)
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
    servicePath,
    onMessage
  } = {}) {
    const { appspace, id } = this.validateServicePath(servicePath)

    this.onMessage = onMessage

    this.ipc = new ipc.IPC()
    this.ipc.config.silent = true
    this.ipc.config.appspace = `${appspace}.`
    this.ipc.config.id = id
    this.ipc.servicePath = servicePath
  }

  static create = ({
    servicePath,
    onMessage
  }) => {
    const server = new Service({
      servicePath,
      onMessage
    })

    return server.start()
  }
}

export { Service }
