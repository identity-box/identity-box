import base64url from 'base64url'
import { Buffers } from '@react-frontend-developer/buffers'
import nacl from 'tweetnacl'

// why 12? why not...
const clientIdEntropy = 12

const _instances = {}

class MultiTelepathConfiguration {
  id

  key

  appName

  clientId

  servicePointId

  transient = false

  static instance = (name, transient) => {
    if (!_instances[name]) {
      _instances[name] = new MultiTelepathConfiguration(name, transient)
    }
    return _instances[name]
  }

  static reset = name => {
    localStorage.removeItem(`telepathChannelId-${name}`)
    localStorage.removeItem(`telepathChannelKey-${name}`)
    localStorage.removeItem(`telepathChannelAppName-${name}`)
    localStorage.removeItem(`telepathChannelClientId-${name}`)
    localStorage.removeItem(`telepathChannelServicePointId-${name}`)
  }

  static recall = name => {
    const id = localStorage.getItem(`telepathChannelId-${name}`)
    const key = localStorage.getItem(`telepathChannelKey-${name}`)
    const appName = localStorage.getItem(`telepathChannelAppName-${name}`)
    const clientId = localStorage.getItem(`telepathChannelClientId-${name}`)
    const servicePointId = localStorage.getItem(`telepathChannelServicePointId-${name}`)

    return {
      id,
      key,
      appName,
      clientId,
      servicePointId
    }
  }

  constructor (name, transient) {
    this.name = name
    this.transient = transient
  }

  createClientId = () => {
    const clientIdBytes = nacl.randomBytes(clientIdEntropy)
    return base64url.encode(clientIdBytes)
  }

  hasConfiguration = () => {
    return (this.id && this.key && this.appName && this.clientId)
  }

  set = channelDescription => {
    if (!channelDescription) {
      throw new Error('missing channel description')
    }
    console.log(`using provided channel description to set telepath configuration with name ${this.name}`)
    const { id, key, appName, servicePointId } = channelDescription
    const clientId = this.createClientId()
    this.remember(this.name, { id, key, appName, clientId, servicePointId })
  }

  readConfigurationFromEnvironment = () => {
    return process.env.telepath[this.name]
  }

  get = () => {
    if (this.hasConfiguration()) {
      return {
        id: this.id,
        key: this.key,
        appName: this.appName,
        clientId: this.clientId,
        servicePointId: this.servicePointId
      }
    }

    console.log(`No active telepath configuration with name ${this.name}. Restoring...`)

    const { id, key, appName, clientId, servicePointId } = MultiTelepathConfiguration.recall(this.name)
    if (id === null || key === null || appName === null || clientId === null) {
      const configuration = this.readConfigurationFromEnvironment()
      if (configuration) {
        this.remember(this.name, configuration)
        return {
          id: this.id,
          key: this.key,
          appName: this.appName,
          clientId: this.clientId,
          servicePointId: this.servicePointId
        }
      }
      console.log(`Restoring configuration with name ${this.name} failed.`)
      console.log(`Did you forget to put your initial configuration in your next.config.js?`)
      return undefined
    }

    console.log(`Restoring succeeded.`)

    return {
      id,
      key: Buffers.copyToUint8Array(base64url.toBuffer(key)),
      appName: base64url.decode(appName),
      clientId,
      servicePointId
    }
  }

  configurationChanged = ({ id, key, appName, clientId }) => {
    return (this.id !== id ||
        base64url.encode(this.key) !== key ||
        base64url.encode(this.appName) !== appName ||
        this.clientId !== clientId)
  }

  remember = (name, { id, key, appName, clientId, servicePointId }) => {
    if (this.configurationChanged({ id, key, appName, clientId })) {
      this.id = id
      this.key = Buffers.copyToUint8Array(base64url.toBuffer(key))
      this.appName = base64url.decode(appName)
      this.clientId = clientId
      this.servicePointId = servicePointId
      if (!this.transient) {
        localStorage.setItem(`telepathChannelId-${name}`, this.id)
        localStorage.setItem(`telepathChannelKey-${name}`, base64url.encode(this.key))
        localStorage.setItem(`telepathChannelAppName-${name}`, base64url.encode(this.appName))
        localStorage.setItem(`telepathChannelClientId-${name}`, this.clientId)
        if (this.servicePointId) {
          localStorage.setItem(`telepathChannelServicePointId-${name}`, this.servicePointId)
        }
      }
    }
  }

  exists = async (name) => {
    const { id, key, appName, clientId } = await MultiTelepathConfiguration.recall(name)
    return !((id === null || key === null || appName === null || clientId === null))
  }
}

export { MultiTelepathConfiguration }
