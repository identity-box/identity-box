import ipc from 'node-ipc'
import commander from 'commander'

const program = new commander.Command()

const startClientIPC = ({ serviceNamespace, serviceName }) => {
  ipc.config.retry = 1000

  const socketName = `${serviceNamespace}.${serviceName}`

  ipc.connectTo(
    socketName,
    `${ipc.config.socketRoot}${serviceNamespace}.${serviceName}`,
    () => {
      ipc.of[socketName].on(
        'connect',
        () => {
          ipc.log(`## connected to ${serviceNamespace}.${serviceName} ##`)
          ipc.of[socketName].emit(
            'message',
            {
              id: 'idservice',
              message: `hello [${serviceNamespace}.${serviceName}]`
            }
          )
        }
      )
      ipc.of[socketName].on(
        'disconnect',
        () => {
          ipc.log(`disconnected from ${serviceNamespace}.${serviceName}`)
        }
      )
      ipc.of[socketName].on(
        'message',
        (data) => {
          ipc.log(`got a message from ${serviceNamespace}.${serviceName}: `, data)
        }
      )
      console.log(ipc.of[socketName].destroy)
    }
  )
}

const connectTo = (endPoint) => {
  const [serviceNamespace, serviceName] = endPoint.split('.')
  if (serviceName === undefined || serviceName.length === 0) {
    console.log('missing service name: the path should be in the format: service-namespace.service-name')
    return false
  }
  console.log(`Using socket path: ${ipc.config.socketRoot}${endPoint}`)
  startClientIPC({ serviceNamespace, serviceName })
}

const run = async cmdObj => {
  const { endPoint1, endPoint2 } = cmdObj
  ipc.log('============ Service 1 ================')
  connectTo(endPoint1)

  if (endPoint2) {
    ipc.log('============ Service 2 ================')
    connectTo(endPoint2)
  }
}

async function main () {
  program
    .version('0.1.0')
    .requiredOption('-1, --end-point-1 <path>', 'point separated service path for service-1: service-name-space.service-name, eg. crocs.authentication-service')
    .option('-2, --end-point-2 <path>', '[optional] point separated service path for service-2: service-name-space.service-name, eg. crocs.name-service')
    .action(run)

  await program.parse(process.argv)
}

main()
