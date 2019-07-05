import ipfsClient from 'ipfs-http-client'
import path from 'path'
import { Telepath } from '../telepath'

const getTelepath = async () => {
  const telepath = new Telepath({
    path: path.resolve(path.dirname(require.main.filename), 'telepath.config'),
    queuingServiceUrl: 'https://idbox-queue.now.sh',
    baseUrl: 'https://idbox.now.sh'
  })
  telepath.toString()
  await telepath.printQRCodeOnTerminal()
  return telepath
}

const start = async () => {
  const telepath = await getTelepath()
  const subscription = telepath.subscribe(message => {
    console.log('received message:', message)
  }, error => {
    console.log('error: ' + error)
  })

  process.on('SIGINT', () => {
    console.log('\nUnsubscribing from telepath and exiting...')

    telepath.unsubscribe(subscription)

    process.exit(0)
  })

  const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

  if (!process.argv[2]) {
    throw new Error('No CID argument provided!')
  }

  const cid = process.argv[2]

  ipfs.dag.get(cid, async (err, result) => {
    if (err) {
      console.error('error: ' + err)
      throw new Error(err)
    }
    console.log(result.value)
  })
}

export { start }
