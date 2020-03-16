import ipc from 'node-ipc'

ipc.config.appspace = 'crocs.'
ipc.config.id = 'authentication-service'
ipc.config.retry = 1000

ipc.connectTo(
  ipc.config.id,
  () => {
    ipc.of[ipc.config.id].on(
      'connect',
      () => {
        ipc.log(`## connected to ${ipc.config.appspace}${ipc.config.id} ##`)
        ipc.of[ipc.config.id].emit(
          'message',
          {
            from: 'idservice',
            message: 'hello'
          }
        )
      }
    )
    ipc.of[ipc.config.id].on(
      'disconnect',
      () => {
        ipc.log(`disconnected from ${ipc.config.appspace}${ipc.config.id}`)
      }
    )
    ipc.of[ipc.config.id].on(
      'message',
      (data) => {
        ipc.log(`got a message from ${ipc.config.appspace}${ipc.config.id}: `, data)
      }
    )
    console.log(ipc.of[ipc.config.id].destroy)
  }
)
