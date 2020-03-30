import ipc from 'node-ipc'

class ServiceProxy {
  ipc
  servicePath

  constructor (servicePath) {
    this.servicePath = servicePath
  }

  connect = () => {
    this.ipc = new ipc.IPC()
    this.ipc.config.silent = true

    return new Promise((resolve, reject) => {
      this.ipc.connectTo(
        this.servicePath,
        `${this.ipc.config.socketRoot}${this.servicePath}`,
        () => {
          this.ipc.of[this.servicePath].on(
            'connect',
            () => {
              this.ipc.log(`## connected to ${this.servicePath} ##`)
              resolve()
            }
          )
          this.ipc.of[this.servicePath].on(
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
      this.ipc.of[this.servicePath].on(
        'message',
        data => {
          this.ipc.log(`got a message from ${this.servicePath}`, data)
          resolve(data)
        }
      )
    })
    this.ipc.of[this.servicePath].emit(
      'message',
      {
        id: 'identity-box',
        ...rpcObject
      }
    )
    return promise
  }

  send = async rpcObject => {
    await this.connect()
    const response = await this.sendRPC(rpcObject)
    this.ipc.disconnect(this.servicePath)
    return {
      status: response.status,
      data: {
        ...response.response
      }
    }
  }
}

export { ServiceProxy }
