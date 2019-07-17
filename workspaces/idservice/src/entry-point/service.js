import ipfsClient from 'ipfs-http-client'
import path from 'path'
import { Telepath } from '../telepath'
import { createIdentity } from '../identity'

const getTelepath = async () => {
  const telepath = new Telepath({
    path: path.resolve(process.cwd(), 'telepath.config'),
    queuingServiceUrl: process.env.serviceUrl || 'https://idbox-queue.now.sh',
    baseUrl: 'https://idbox.now.sh'
  })
  telepath.describe()
  await telepath.printQRCodeOnTerminal()
  return telepath
}

const idservice = async () => {
  const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
  const telepath = await getTelepath()
  const subscription = await telepath.subscribe(async message => {
    if (message.method === 'create_identity' && message.params && message.params.length === 1) {
      const { name, publicEncryptionKey, publicSigningKey } = message.params[0]
      console.log(`Creating identity with name "${name}"`)
      const identity = createIdentity({
        name,
        publicEncryptionKey,
        publicSigningKey
      })
      try {
        const message = {
          jsonrpc: '2.0',
          method: 'set_identity',
          params: [
            { identity }
          ]
        }
        await telepath.emit(message)
      } catch (e) {
        console.error(e.message)
      }
    }
  }, error => {
    console.log('error: ' + error)
  })

  const message = { jsonrpc: '2.0', method: 'test' }
  telepath.emit(message)

  process.on('SIGINT', () => {
    console.log('\nUnsubscribing from telepath and exiting...')

    telepath.unsubscribe(subscription)

    process.exit(0)
  })

  if (!process.argv[2]) {
    console.log('No CID argument provided!')
    return
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

export { idservice }
