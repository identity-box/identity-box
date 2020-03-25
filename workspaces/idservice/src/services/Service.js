import ipc from 'node-ipc'

class Service {
  ipc
  serviceNamespace
  serviceName
  socketName

  connect = () => {
    this.serviceNamespace = 'service-manager'
    this.serviceName = 'service-1'
    this.socketName = `${this.serviceNamespace}.${this.serviceName}`
    this.ipc = new ipc.IPC()
    this.ipc.config.silent = true

    return new Promise((resolve, reject) => {
      this.ipc.connectTo(
        this.socketName,
        `${this.ipc.config.socketRoot}${this.socketName}`,
        () => {
          this.ipc.of[this.socketName].on(
            'connect',
            () => {
              this.ipc.log(`## connected to ${this.socketName} ##`)
              resolve()
            }
          )
          this.ipc.of[this.socketName].on(
            'destroy',
            () => {
              reject(new Error('DESTROY, DESTROY!'))
            }
          )
        }
      )
    })
  }

  sendRPC = rpcObject => {
    const promise = new Promise(resolve => {
      this.ipc.of[this.socketName].on(
        'message',
        data => {
          this.ipc.log(`got a message from ${this.socketName}`, data)
          resolve(data)
        }
      )
    })
    this.ipc.of[this.socketName].emit(
      'message',
      {
        id: 'idservice',
        ...rpcObject
      }
    )
    return promise
  }

  send = async rpcObject => {
    await this.connect()
    const response = await this.sendRPC(rpcObject)
    this.ipc.disconnect(this.socketName)
    return {
      status: 'SUCCESS',
      data: {
        ...response.response
      }
    }
  }
}

export { Service }
