import { AsyncStorage } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import nacl from 'tweetnacl'
import { Buffers, TypedArrays } from '@react-frontend-developer/buffers'
import { randomBytes, entropyToMnemonic } from 'src/crypto'

let _instance = null

class IdentityManager {
  identityNames = []

  identities = {}

  peerIdentities = {}

  subscriptions = []

  get peerIdentityNames () {
    return Object.keys(this.peerIdentities)
  }

  get keyNames () {
    return Object.values(this.identities).map(id => id.keyName || id.name)
  }

  current

  static instance = async () => {
    if (!_instance) {
      _instance = new IdentityManager()
      // await _instance.reset()
      await _instance.readIdentities()
      await _instance.readPeerIdentities()
    }
    return _instance
  }

  writeIdentityToSecureStore = async identity => {
    const { name, encryptionKey, signingKey } = identity
    const encryptionKeyBase64 = {
      publicKeyBase64: base64url.encode(encryptionKey.publicKey),
      secretKeyBase64: base64url.encode(encryptionKey.secretKey)
    }
    const signingKeyBase64 = {
      publicKeyBase64: base64url.encode(signingKey.publicKey),
      secretKeyBase64: base64url.encode(signingKey.secretKey)
    }
    const key = base64url.encode(name)
    const value = base64url.encode(JSON.stringify({
      ...identity,
      encryptionKey: encryptionKeyBase64,
      signingKey: signingKeyBase64
    }))
    await SecureStore.setItemAsync(key, value)
  }

  addIdentity = async ({
    did,
    name,
    keyName,
    encryptionKeyPair: encryptionKey,
    signingKeyPair: signingKey
  }) => {
    const identity = {
      name,
      keyName,
      did,
      encryptionKey,
      signingKey
    }
    this.identities[name] = identity
    await this.writeIdentityToSecureStore(identity)
    this.identityNames = [...this.identityNames, name]
    await AsyncStorage.setItem('identityNames', JSON.stringify(this.identityNames))
    this.notify('onOwnIdentitiesChanged', {
      currentIdentity: this.current,
      identities: this.identities,
      identityNames: this.identityNames
    })
  }

  migrateIdentityNames = async migrationData => {
    migrationData.forEach(({ oldName, newName }) => {
      this.identities[oldName].keyName = newName
    })
    await Promise.all(Object.values(this.identities).map(async identity => {
      await this.writeIdentityToSecureStore(identity)
    }))
  }

  deleteIdentity = async ({ name }) => {
    if (this.identityNames.includes(name)) {
      const currentIdentityName = this.current.name
      const key = base64url.encode(name)
      await SecureStore.deleteItemAsync(key)
      delete this.identities[name]
      this.identityNames = this.identityNames.filter(idName => idName !== name)
      await AsyncStorage.setItem('identityNames', JSON.stringify(this.identityNames))
      if (currentIdentityName === name) {
        if (this.identityNames.length > 0) {
          this.setCurrent(this.identityNames[0])
        } else {
          this.current = undefined
        }
      }
      this.notify('onOwnIdentitiesChanged', {
        currentIdentity: this.current,
        identities: this.identities,
        identityNames: this.identityNames
      })
    }
  }

  createBackupKey = async () => {
    return randomBytes(nacl.secretbox.keyLength)
  }

  createEncryptedBackupWithKey = async backupKey => {
    const backupBox = await this.createBackupBox()

    const nonce = await randomBytes(nacl.secretbox.nonceLength)
    const secretBackupBox = nacl.secretbox(
      TypedArrays.string2Uint8Array(backupBox, 'utf8'),
      nonce,
      backupKey
    )
    return base64url.encode(Buffer.concat([Buffer.from(nonce), Buffer.from(secretBackupBox)]))
  }

  createEncryptedBackup = async () => {
    const backupKey = await this.createBackupKey()
    await SecureStore.setItemAsync('backupKey', base64url.encode(backupKey))
    const backupBox = await this.createBackupBox()

    const nonce = await randomBytes(nacl.secretbox.nonceLength)
    const secretBackupBox = nacl.secretbox(
      TypedArrays.string2Uint8Array(backupBox, 'utf8'),
      nonce,
      backupKey
    )
    const mnemonic = entropyToMnemonic(backupKey)
    return {
      encryptedBackup: base64url.encode(Buffer.concat([Buffer.from(nonce), Buffer.from(secretBackupBox)])),
      mnemonic
    }
  }

  initFromEncryptedBackup = async (encryptedBackup, backupKey) => {
    const backupAndNonce = TypedArrays.string2Uint8Array(encryptedBackup, 'base64')
    const nonce = backupAndNonce.slice(0, nacl.secretbox.nonceLength)
    const backup = backupAndNonce.slice(nacl.secretbox.nonceLength)
    const backupBoxUint8Array = nacl.secretbox.open(backup, nonce, backupKey)
    const backupBoxBase64 = TypedArrays.uint8Array2string(backupBoxUint8Array, 'utf8')
    const backupBox = JSON.parse(base64url.decode(backupBoxBase64))
    const { ownIdentities, peerIdentities } = backupBox
    await AsyncStorage.setItem('peerIdentities', base64url.decode(peerIdentities))
    const identities = ownIdentities.reduce((acc, identity) => {
      const { name } = JSON.parse(base64url.decode(identity))
      acc[name] = identity
      return acc
    }, {})
    const identityNames = Object.keys(identities)
    await AsyncStorage.setItem('identityNames', JSON.stringify(identityNames))
    await Promise.all(identityNames.map(name => {
      const key = base64url.encode(name)
      return SecureStore.setItemAsync(key, identities[name])
    }))
    await SecureStore.setItemAsync('backupEnabled', 'true')
    await SecureStore.setItemAsync('backupKey', base64url.encode(backupKey))
    await this.readIdentities()
    await this.readPeerIdentities()
  }

  createBackupBox = async () => {
    const serializableIdentities = await Promise.all(this.identityNames.map(async idName => {
      const key = base64url.encode(idName)
      return SecureStore.getItemAsync(key)
    }))

    const serializablePeerIdentities = base64url.encode(
      await AsyncStorage.getItem('peerIdentities') ||
      JSON.stringify([])
    )

    return base64url.encode(JSON.stringify({
      ownIdentities: serializableIdentities,
      peerIdentities: serializablePeerIdentities
    }))
  }

  addPeerIdentity = async ({ name, did }) => {
    this.peerIdentities = { ...this.peerIdentities, [name]: did }
    await AsyncStorage.setItem('peerIdentities', JSON.stringify(this.peerIdentities))
    this.notify('onPeerIdentitiesChanged', {
      peerIdentities: this.peerIdentities,
      addedIdentity: { name, did }
    })
    return this.peerIdentities
  }

  deletePeerIdentity = async ({ name }) => {
    delete this.peerIdentities[name]
    this.peerIdentities = { ...this.peerIdentities }
    await AsyncStorage.setItem('peerIdentities', JSON.stringify(this.peerIdentities))
    this.notify('onPeerIdentitiesChanged', {
      peerIdentities: this.peerIdentities,
      deletedIdentity: { name }
    })
    return this.peerIdentities
  }

  notify = (observerName, params) => {
    this.subscriptions.filter(s => s !== 'free').forEach(s => {
      s[observerName] && s[observerName](params)
    })
  }

  subscribe = subscription => {
    const firstFreePosition = this.subscriptions.indexOf('free')
    if (firstFreePosition === -1) {
      this.subscriptions = [
        ...this.subscriptions,
        subscription
      ]
      return this.subscriptions.length - 1
    } else {
      this.subscriptions[firstFreePosition] = subscription
      return firstFreePosition
    }
  }

  unsubscribe = subscriptionId => {
    this.subscriptions[subscriptionId] = 'free'
  }

  fromDID = did => {
    const identities = Object.values(this.identities).filter(identity => {
      if (identity.did === did) {
        return true
      }
      return false
    })
    return identities.length === 1 ? identities[0] : undefined
  }

  setCurrent = async name => {
    this.current = this.identities[name]
    await AsyncStorage.setItem('selectedIdentityName', name)
    this.notify('currentIdentityChanged', {
      currentIdentity: this.current
    })
  }

  getCurrent = () => {
    return this.current
  }

  readIdentities = async () => {
    const identityNamesStr = await AsyncStorage.getItem('identityNames')

    if (!identityNamesStr) return

    this.identityNames = JSON.parse(identityNamesStr)

    this.identities = await Promise.all(this.identityNames.map(async idName => {
      const key = base64url.encode(idName)
      const v = await SecureStore.getItemAsync(key)
      return JSON.parse(base64url.decode(v))
    }))

    this.identities = this.identities.reduce((acc, identity) => {
      const { did, name, encryptionKey, signingKey, keyName } = identity
      acc[name] = {
        name,
        keyName,
        did,
        encryptionKey: {
          publicKey: Buffers.copyToUint8Array(base64url.toBuffer(encryptionKey.publicKeyBase64)),
          secretKey: Buffers.copyToUint8Array(base64url.toBuffer(encryptionKey.secretKeyBase64))
        },
        signingKey: {
          publicKey: Buffers.copyToUint8Array(base64url.toBuffer(signingKey.publicKeyBase64)),
          secretKey: Buffers.copyToUint8Array(base64url.toBuffer(signingKey.secretKeyBase64))
        }
      }
      return acc
    }, {})

    const currentName = await AsyncStorage.getItem('selectedIdentityName')

    if (!currentName) {
      this.current = this.identities[this.identityNames[0]]
    } else {
      this.current = this.identities[currentName]
    }
  }

  readPeerIdentities = async () => {
    const peerIdentitiesStr = await AsyncStorage.getItem('peerIdentities')

    if (!peerIdentitiesStr) return

    this.peerIdentities = JSON.parse(peerIdentitiesStr)
  }

  reset = async () => {
    await Promise.all(this.identityNames.map(async idName => {
      const key = base64url.encode(idName)
      await SecureStore.deleteItemAsync(key)
    }))
    await SecureStore.deleteItemAsync('backupEnabled')
    await AsyncStorage.removeItem('identityNames')
    this.identityNames = []
    this.identities = {}
    await AsyncStorage.removeItem('selectedIdentityName')
    this.current = undefined
    await AsyncStorage.removeItem('peerIdentities')
    this.peerIdentities = {}
    this.subscriptions = []
  }

  hasIdentities = () => {
    return Object.keys(this.identities).length > 0
  }

  hasPeerIdentities = () => {
    return Object.keys(this.peerIdentities).length > 0
  }
}

export { IdentityManager }
