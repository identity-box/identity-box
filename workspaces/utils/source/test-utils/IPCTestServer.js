import ipc from '@node-ipc/node-ipc'

class IPCTestServer {
  ipc
  clientDisconnected
  clientDisconnectedPromise
  neverConnected = true
  rpcResponses = []

  emptyResponse = () => {
    return {
      method: 'empty-response',
      params: []
    }
  }

  queueExpectedResponse = rpcResponseObject => {
    this.rpcResponses.push(rpcResponseObject)
    return rpcResponseObject
  }

  nextExpectedResponse = () => {
    if (this.rpcResponses.length === 0) {
      return this.emptyResponse()
    }
    return this.rpcResponses.shift()
  }

  isClientDisconnected = () => {
    if (this.neverConnected) {
      this.ipc.server.stop()
      return Promise.resolve()
    }
    return this.clientDisconnectedPromise
  }

  start = () => {
    return new Promise(resolve => {
      this.ipc.serve(
        () => {
          this.ipc.server.on(
            'connect',
            () => {
              this.neverConnected = false
            }
          )
          resolve()
        }
      )
      this.ipc.server.start()
    })
  }

  addMessageHandler = () => {
    this.ipc.server.on(
      'message',
      (data, socket) => {
        const response = this.nextExpectedResponse()
        this.ipc.server.emit(
          socket,
          'message',
          {
            id: `${this.ipc.socketName}`,
            response
          }
        )
      }
    )
  }

  addDisconnectHandler = () => {
    this.ipc.server.on(
      'socket.disconnected',
      () => {
        this.ipc.server.stop()
        this.clientDisconnected()
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

  constructor (servicePath) {
    const { appspace, id } = this.validateServicePath(servicePath)

    this.ipc = new ipc.IPC()
    this.ipc.config.silent = true
    this.ipc.config.appspace = `${appspace}.`
    this.ipc.config.id = id
    this.ipc.socketName = `${this.ipc.config.appspace}${this.ipc.config.id}`

    this.clientDisconnectedPromise = new Promise(resolve => {
      this.clientDisconnected = resolve
    })
  }

  static create = async servicePath => {
    const server = new IPCTestServer(servicePath)

    await server.start()
    server.addDisconnectHandler()
    server.addMessageHandler()

    return server
  }
}

export { IPCTestServer }
