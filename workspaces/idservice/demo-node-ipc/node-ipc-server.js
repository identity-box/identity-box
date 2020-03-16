import ipc from 'node-ipc'

ipc.config.appspace = 'crocs.'
ipc.config.id = 'authentication-service'
ipc.config.retry = 1500

ipc.serve(
  () => {
    ipc.server.on(
      'message',
      (data, socket) => {
        ipc.server.emit(
          socket,
          'message',
          {
            from: `${ipc.config.appspace}${ipc.config.id}`,
            message: data.message + ' world!'
          }
        )
      }
    )
  }
)

ipc.server.start()
