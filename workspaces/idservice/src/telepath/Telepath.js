import fs from 'fs'
import base64url from 'base64url'
import qrcodeTerminal from 'qrcode-terminal'
import { Buffers } from '@react-frontend-developer/buffers'
import { Telepath as TelepathOrig } from '@identity-box/telepath'

class Telepath {
  path
  queuingServiceUrl
  baseUrl
  telepath
  channel

  get id () {
    return this.channel.id
  }

  get key () {
    return this.channel.key
  }

  get appName () {
    return this.channel.appName
  }

  get connectUrl () {
    return this.channel.createConnectUrl(this.baseUrl)
  }

  constructor ({ path, queuingServiceUrl, baseUrl }) {
    this.path = path
    this.queuingServiceUrl = queuingServiceUrl
    this.baseUrl = baseUrl
    this.telepath = new TelepathOrig(queuingServiceUrl)
    if (!fs.existsSync(path)) {
      console.log(`No telepath configuration found in ${path}.`)
      console.log('Creating new telepath channel...')
      this.channel = this.telepath.createChannel({ appName: 'IdentityBox' })
      this.write()
    } else {
      console.log(`Found telepath configuration in ${path}`)
      this.channel = this.read()
    }
  }

  read = () => {
    const telepathConfigurationString = fs.readFileSync(this.path, 'UTF-8')
    const [channelId, keyBase64, appNameBase64] = telepathConfigurationString.split(' ')

    return this.telepath.createChannel({
      id: channelId,
      key: Buffers.copyToUint8Array(base64url.toBuffer(keyBase64)),
      appName: base64url.decode(appNameBase64)
    })
  }

  write = () => {
    const { id, key, appName } = this.channel
    const configurationString = `${id} ${base64url.encode(key)} ${base64url.encode(appName)}`

    fs.writeFileSync(this.path, configurationString)
  }

  toString = () => {
    this.channel.toString({ baseUrl: this.baseUrl })
  }

  printQRCodeOnTerminal = async () => {
    try {
      await qrcodeTerminal.generate(this.connectUrl, { small: true })
    } catch (err) {
      console.error(err)
    }
  }
}

export { Telepath }
