import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import { Buffers } from '@react-frontend-developer/buffers'
import { randomBytes } from 'src/crypto'

// why 12? why not...
const clientIdEntropy = 12

let _instance = null

class TelepathConfiguration {
  id
  key
  appName
  clientId

  static instance = async channelDescription => {
    if (!_instance) {
      // uncomment to reset telepath configuration
      // await TelepathConfiguration.reset()
      _instance = new TelepathConfiguration()
      await _instance.set(channelDescription)
    }
    return _instance
  }

  static reset = async () => {
    await SecureStore.deleteItemAsync('telepathChannelId')
    await SecureStore.deleteItemAsync('telepathChannelKey')
    await SecureStore.deleteItemAsync('telepathChannelAppName')
    await SecureStore.deleteItemAsync('telepathChannelClientId')
  }

  static recall = async () => {
    const id = await SecureStore.getItemAsync('telepathChannelId')
    const key = await SecureStore.getItemAsync('telepathChannelKey')
    const appName = await SecureStore.getItemAsync('telepathChannelAppName')
    const clientId = await SecureStore.getItemAsync('telepathChannelClientId')

    return {
      id,
      key,
      appName,
      clientId
    }
  }

  set = async channelDescription => {
    let id, key, appName, clientId
    if (channelDescription) {
      console.log('using provided telepath configuration')
      ;({ id, key, appName } = channelDescription)
      clientId = await this.createClientId()
    } else {
      console.log('using remembered telepath configuration')
      ;({ id, key, appName, clientId } = await TelepathConfiguration.recall())
      if (id === null || key === null || appName === null || clientId === null) {
        throw new Error('Failure creating telepath configuration!')
      }
    }

    await this.remember({ id, key, appName, clientId })
  }

  createClientId = async () => {
    const clientIdBytes = await randomBytes(clientIdEntropy)
    return base64url.encode(clientIdBytes)
  }

  get = () => {
    return {
      id: this.id,
      key: this.key,
      appName: this.appName,
      clientId: this.clientId
    }
  }

  configurationChanged = ({ id, key, appName, clientId }) => {
    return (this.id !== id ||
        base64url.encode(this.key) !== key ||
        base64url.encode(this.appName) !== appName ||
        this.clientId !== clientId)
  }

  remember = async ({ id, key, appName, clientId }) => {
    if (this.configurationChanged({ id, key, appName, clientId })) {
      this.id = id
      this.key = Buffers.copyToUint8Array(base64url.toBuffer(key))
      this.appName = base64url.decode(appName)
      this.clientId = clientId
      await SecureStore.setItemAsync('telepathChannelId', this.id)
      await SecureStore.setItemAsync('telepathChannelKey', base64url.encode(this.key))
      await SecureStore.setItemAsync('telepathChannelAppName', base64url.encode(this.appName))
      await SecureStore.setItemAsync('telepathChannelClientId', this.clientId)
    }
  }

  exists = async () => {
    const { id, key, appName, clientId } = await TelepathConfiguration.recall()
    return !((id === null || key === null || appName === null || clientId === null))
  }
}

export { TelepathConfiguration }
