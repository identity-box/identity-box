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
      let id, key, appName, clientId
      if (channelDescription) {
        console.log('using provided telepath configuration')
        ;({ id, key, appName } = channelDescription)
      } else {
        console.log('using remembered telepath configuration')
        ;({ id, key, appName, clientId } = await TelepathConfiguration.recall())
        if (id === null || key === null || appName === null || clientId === null) {
          throw new Error('Failure creating telepath configuration!')
        }
      }
      _instance = new TelepathConfiguration(({ id, key, appName, clientId }))
      if (!clientId) {
        await _instance.createClientId()
      }
      await _instance.remember()
      await TelepathConfiguration.recall()
    }
    return _instance
  }

  static recall = async () => {
    const id = await SecureStore.getItemAsync('telepathChannelId')
    const key = await SecureStore.getItemAsync('telepathChannelKey')
    const appName = await SecureStore.getItemAsync('telepathChannelAppName')
    const clientId = await SecureStore.getItemAsync('telepathChannelClientId')

    console.log('recorded telepath configuration:')
    console.log('id:', id)
    console.log('key:', key)
    console.log('appName:', appName)
    console.log('clientId:', clientId)

    return {
      id,
      key,
      appName,
      clientId
    }
  }

  constructor ({ id, key, appName, clientId }) {
    this.id = id
    this.key = Buffers.copyToUint8Array(base64url.toBuffer(key))
    this.appName = base64url.decode(appName)
  }

  createClientId = async () => {
    const clientIdBytes = await randomBytes(clientIdEntropy)
    this.clientId = base64url.encode(clientIdBytes)
  }

  get = () => {
    return {
      id: this.id,
      key: this.key,
      appName: this.appName,
      clientId: this.clientId
    }
  }

  remember = async () => {
    await SecureStore.setItemAsync('telepathChannelId', this.id)
    await SecureStore.setItemAsync('telepathChannelKey', base64url.encode(this.key))
    await SecureStore.setItemAsync('telepathChannelAppName', this.appName)
    await SecureStore.setItemAsync('telepathChannelClientId', this.clientId)
  }
}

export { TelepathConfiguration }
