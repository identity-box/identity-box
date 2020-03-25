import NodeIPC from 'node-ipc'
import commander from 'commander'

const program = new commander.Command()

const startClientIPC = ({ serviceNamespace, serviceName, instanceId }) => {
  const ipc = new NodeIPC.IPC()

  ipc.config.retry = 1000
  ipc.config.silent = true
  ipc.instanceId = instanceId
  ipc.socketName = `${serviceNamespace}.${serviceName}`

  return new Promise(resolve => {
    if (ipc.connected) {
      resolve(ipc)
    } else {
      ipc.connectTo(
        ipc.socketName,
        `${ipc.config.socketRoot}${ipc.socketName}`,
        () => {
          ipc.of[ipc.socketName].on(
            'connect',
            () => {
              ipc.connected = true
              console.log(`## connected to ${ipc.socketName} [instanceId: ${instanceId}]##`)
              resolve(ipc)
            }
          )
          ipc.of[ipc.socketName].on(
            'disconnect',
            () => {
              console.log(`***disconnected from ${ipc.socketName} [instanceId: ${instanceId}]***`)
            }
          )
          ipc.of[ipc.socketName].on(
            'message',
            (data) => {
              console.log(`---i am handler for instanceId:${instanceId}---`)
              console.log(`got a message from ${ipc.socketName}: `, data)
              ipc.disconnect(ipc.socketName)
            }
          )
        }
      )
    }
  })
}

const emit = ipc => {
  ipc.of[ipc.socketName].emit(
    'message',
    {
      id: 'idservice',
      message: `hello [${ipc.socketName}] [instanceId: ${ipc.instanceId}]`
    }
  )
}

const connectTo = (endPoint, instanceId) => {
  const [serviceNamespace, serviceName] = endPoint.split('.')
  if (serviceName === undefined || serviceName.length === 0) {
    console.log('missing service name: the path should be in the format: service-namespace.service-name')
    return false
  }
  return startClientIPC({ serviceNamespace, serviceName, instanceId })
}

const run = async cmdObj => {
  const { endPoint1, endPoint2 } = cmdObj
  console.log('============ Service 1 ================')
  const ipc1 = await connectTo(endPoint1, 1)

  if (endPoint2) {
    console.log('============ Service 2 ================')
    const ipc2 = await connectTo(endPoint2, 2)
    emit(ipc2)
  }

  emit(ipc1)
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
