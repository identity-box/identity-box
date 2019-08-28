import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import { Buffers } from '@react-frontend-developer/buffers'
import { randomBytes } from 'src/crypto'

// why 12? why not...
const clientIdEntropy = 12

const _instances = {}

class MultiTelepathConfiguration {
  id

  key

  appName

  clientId

  servicePointId

  static instance = name => {
    if (!_instances[name]) {
      _instances[name] = new MultiTelepathConfiguration(name)
    }
    return _instances[name]
  }

  static reset = async name => {
    await SecureStore.deleteItemAsync(`telepathChannelId-${name}`)
    await SecureStore.deleteItemAsync(`telepathChannelKey-${name}`)
    await SecureStore.deleteItemAsync(`telepathChannelAppName-${name}`)
    await SecureStore.deleteItemAsync(`telepathChannelClientId-${name}`)
    await SecureStore.deleteItemAsync(`telepathChannelServicePointId-${name}`)
  }

  static recall = async name => {
    const id = await SecureStore.getItemAsync(`telepathChannelId-${name}`)
    const key = await SecureStore.getItemAsync(`telepathChannelKey-${name}`)
    const appName = await SecureStore.getItemAsync(`telepathChannelAppName-${name}`)
    const clientId = await SecureStore.getItemAsync(`telepathChannelClientId-${name}`)
    const servicePointId = await SecureStore.getItemAsync(`telepathChannelServicePointId-${name}`)

    return {
      id,
      key,
      appName,
      clientId,
      servicePointId
    }
  }

  constructor (name) {
    this.name = name
  }

  createClientId = async () => {
    const clientIdBytes = await randomBytes(clientIdEntropy)
    return base64url.encode(clientIdBytes)
  }

  hasConfiguration = () => {
    return (this.id && this.key && this.appName && this.clientId)
  }

  set = async channelDescription => {
    if (!channelDescription) {
      throw new Error('missing channel description')
    }
    console.log(`using provided channel description to set telepath configuration with name ${this.name}`)
    const { id, key, appName, servicePointId } = channelDescription
    const clientId = await this.createClientId()
    await this.remember(this.name, { id, key, appName, clientId, servicePointId })
  }

  get = async () => {
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

    const { id, key, appName, clientId, servicePointId } = await MultiTelepathConfiguration.recall(this.name)
    if (id === null || key === null || appName === null || clientId === null) {
      console.log(`Restoring configuration with name ${this.name} failed.`)
      console.log(`Did you ever create a configuration with name ${this.name}?`)
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

  remember = async (name, { id, key, appName, clientId, servicePointId }) => {
    if (this.configurationChanged({ id, key, appName, clientId })) {
      this.id = id
      this.key = Buffers.copyToUint8Array(base64url.toBuffer(key))
      this.appName = base64url.decode(appName)
      this.clientId = clientId
      this.servicePointId = servicePointId
      await SecureStore.setItemAsync(`telepathChannelId-${name}`, this.id)
      await SecureStore.setItemAsync(`telepathChannelKey-${name}`, base64url.encode(this.key))
      await SecureStore.setItemAsync(`telepathChannelAppName-${name}`, base64url.encode(this.appName))
      await SecureStore.setItemAsync(`telepathChannelClientId-${name}`, this.clientId)
      if (this.servicePointId) {
        await SecureStore.setItemAsync(`telepathChannelServicePointId-${name}`, this.servicePointId)
      }
    }
  }

  exists = async (name) => {
    const { id, key, appName, clientId } = await MultiTelepathConfiguration.recall(name)
    return !((id === null || key === null || appName === null || clientId === null))
  }
}

export { MultiTelepathConfiguration }
