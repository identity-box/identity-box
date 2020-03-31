import ipc from 'node-ipc'
import commander from 'commander'

const program = new commander.Command()

const setupIPC = ({ serviceNamespace, serviceName }) => {
  ipc.config.appspace = `${serviceNamespace}.`
  ipc.config.id = serviceName
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
              id: `${ipc.config.appspace}${ipc.config.id}`,
              message: data.message + ' world!'
            }
          )
        }
      )
      ipc.server.on(
        'connect',
        () => {
          console.log('==** established connection with a client **==')
        }
      )
    }
  )
}

const run = async cmdObj => {
  const { endPoint } = cmdObj
  const [serviceNamespace, serviceName] = endPoint.split('.')
  if (serviceName === undefined || serviceName.length === 0) {
    console.log('missing service name: the path should be in the format: service-namespace.service-name')
    process.exit(1)
  }
  console.log(`Using socket path: ${ipc.config.socketRoot}${endPoint}`)
  setupIPC({ serviceNamespace, serviceName })
  ipc.server.start()
}

async function main () {
  program
    .version('0.1.0')
    .requiredOption('-e, --end-point <path>', 'point separated service path: service-name-space.service-name, eg. crocs.authentication-service')
    .action(run)

  await program.parse(process.argv)
}

main()
