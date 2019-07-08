import fs from 'fs'
import base64url from 'base64url'
import nacl from 'tweetnacl'
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

  createRandomId = () => {
    const idSize = 18
    const idBytes = nacl.randomBytes(idSize)
    return base64url.encode(idBytes)
  }

  createRandomKey = () => {
    return nacl.randomBytes(nacl.secretbox.keyLength)
  }

  constructor ({ path, queuingServiceUrl, baseUrl }) {
    this.path = path
    this.queuingServiceUrl = queuingServiceUrl
    this.baseUrl = baseUrl
    this.telepath = new TelepathOrig({ serviceUrl: queuingServiceUrl })
    this.createTelepathChannel()
  }

  createTelepathChannel = () => {
    if (!fs.existsSync(this.path)) {
      console.log(`No telepath configuration found in ${this.path}.`)
      console.log('Creating new telepath channel...')
      this.channel = this.telepath.createChannel({
        id: this.createRandomId(),
        key: this.createRandomKey(),
        appName: 'IdentityBox'
      })
      this.write()
    } else {
      console.log(`Found telepath configuration in ${this.path}`)
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

  subscribe = (onMessage, onError) => {
    return this.channel.subscribe(onMessage, onError)
  }

  unsubscribe = subscription => {
    this.channel.unsubscribe(subscription)
  }

  emit = message => {
    this.channel.emit(message)
  }
}

export { Telepath }
