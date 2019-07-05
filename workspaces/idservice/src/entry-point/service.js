import ipfsClient from 'ipfs-http-client'
import path from 'path'
import { Telepath } from '../telepath'

const getTelepath = async () => {
  const telepath = new Telepath({
    path: path.resolve(path.dirname(require.main.filename), 'telepath.config'),
    queuingServiceUrl: 'https://telepath.cogito.mobi',
    baseUrl: 'https://cogito.mobi'
  })
  telepath.toString()
  await telepath.printQRCodeOnTerminal()
  return telepath
}

const start = async () => {
  await getTelepath()
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
