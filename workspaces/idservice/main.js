import ipfsClient from 'ipfs-http-client'
import path from 'path'
import base64url from 'base64url'
import qrcodeTerminal from 'qrcode-terminal'
import { Telepath } from '@identity-box/telepath'
import { readConfiguration } from './src/readConfiguration'
import { writeConfiguration } from './src/writeConfiguration'

const telepathConfigurationPath = path.resolve(path.dirname(require.main.filename), 'telepath.config')

const qrcode = async connectUrl => {
  console.log(connectUrl)
  try {
    await qrcodeTerminal.generate(connectUrl, { small: true })
  } catch (err) {
    console.error(err)
  }
}

const printTelepathConfiguration = async config => {
  console.log('---------------------------------------------------------')
  console.log(`channelId: ${config.id}`)
  console.log(`channelKey: ${base64url.encode(config.key)}`)
  console.log(`appName: ${config.appName}`)
  console.log(`connectUrl: ${config.connectUrl}`)
  console.log('---------------------------------------------------------')
  await qrcode(config.connectUrl)
}

const createTelepathChannel = async ({ id, key, appName = 'IdBox-1', connectUrl } = {}) => {
  const telepath = new Telepath('https://telepath.cogito.mobi')

  const channel = await telepath.createChannel({ id, key, appName })
  const configuration = {
    id: channel.id,
    key: channel.key,
    appName: channel.appName,
    connectUrl: channel.createConnectUrl('https://cogito.mobi')
  }
  return configuration
}

const getTelepath = async onDone => {
  const telepathConfiguration = readConfiguration(telepathConfigurationPath)
  if (telepathConfiguration) {
    console.log(`Found telepath configuration in ${telepathConfigurationPath}`)
    createTelepathChannel({
      id: telepathConfiguration.channelId,
      key: telepathConfiguration.channelKey,
      appName: telepathConfiguration.appName,
      connectUrl: telepathConfiguration.connectUrl
    }).then(configuration => {
      printTelepathConfiguration(configuration)
      onDone && onDone()
    })
  } else {
    console.log(`No telepath configuration found in ${telepathConfigurationPath}.`)
    console.log('Creating new telepath channel...')
    createTelepathChannel().then(configuration => {
      writeConfiguration({
        configuration,
        path: telepathConfigurationPath
      })
      printTelepathConfiguration(configuration)
      onDone && onDone()
    })
  }
}

getTelepath(() => {
  const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

  if (!process.argv[2]) {
    console.log('No CID argument provided!')
    process.exit()
  }

  const cid = process.argv[2]

  ipfs.dag.get(cid, async (err, result) => {
    if (err) {
      console.error('error: ' + err)
      process.exit(1)
    }
    console.log(result.value)
    // process.exit()
  })
})

process.stdin.resume()
