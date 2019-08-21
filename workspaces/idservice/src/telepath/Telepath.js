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

  clientId

  get id () {
    return this.channel.id
  }

  get key () {
    return this.channel.key
  }

  get appName () {
    return this.channel.appName
  }

  get clientId () {
    return this.channel.clientId
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
    this.clientId = base64url.encode(nacl.randomBytes(8))
    this.telepath = new TelepathOrig({ serviceUrl: queuingServiceUrl })
    this.createTelepathChannel()
  }

  createTelepathChannel = () => {
    if (!this.path || !fs.existsSync(this.path)) {
      this.path && console.log(`No telepath configuration found in ${this.path}.`)
      console.log('Creating new telepath channel...')
      this.channel = this.telepath.createChannel({
        id: this.createRandomId(),
        key: this.createRandomKey(),
        appName: 'IdentityBox',
        clientId: this.clientId
      })
      this.write()
    } else {
      console.log(`Found telepath configuration in ${this.path}`)
      this.channel = this.read()
    }
  }

  read = () => {
    const telepathConfigurationString = fs.readFileSync(this.path, 'UTF-8')
    const [channelId, keyBase64, appNameBase64, clientId] = telepathConfigurationString.split(' ')

    return this.telepath.createChannel({
      id: channelId,
      key: Buffers.copyToUint8Array(base64url.toBuffer(keyBase64)),
      appName: base64url.decode(appNameBase64),
      clientId
    })
  }

  write = () => {
    if (!this.path) return
    const { id, key, appName, clientId } = this.channel
    const configurationString = `${id} ${base64url.encode(key)} ${base64url.encode(appName)} ${clientId}`

    fs.writeFileSync(this.path, configurationString)
  }

  describe = () => {
    this.channel.describe({ baseUrl: this.baseUrl })
  }

  printQRCodeOnTerminal = async () => {
    try {
      await qrcodeTerminal.generate(this.connectUrl, { small: true })
    } catch (err) {
      console.error(err)
    }
  }

  connect = async () => {
    await this.channel.connect()
  }

  subscribe = (onMessage, onError) => {
    return this.channel.subscribe(onMessage, onError)
  }

  unsubscribe = subscription => {
    this.channel.unsubscribe(subscription)
  }

  emit = async message => {
    try {
      await this.channel.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }
}

export { Telepath }
