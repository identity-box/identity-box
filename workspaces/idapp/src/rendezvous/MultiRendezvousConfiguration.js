import * as SecureStore from 'expo-secure-store'

const _instances = {}

class MultiRendezvousConfiguration {
  url

  static instance = async name => {
    if (!_instances[name]) {
      await MultiRendezvousConfiguration.upgradeToRendezvous(name)
      _instances[name] = new MultiRendezvousConfiguration(name)
    }
    return _instances[name]
  }

  static upgradeToRendezvous = async name => {
    console.log(`Upgrading from Telepath to Rendezvous for telepath name: ${name}`)
    let somethingDeleted = false
    const {
      id,
      key,
      appName,
      clientId,
      servicePointId
    } = await MultiRendezvousConfiguration.recallLegacy(name)

    if (id) {
      console.log(`Deleting telepathChannelId-${name}`)
      await SecureStore.deleteItemAsync(`telepathChannelId-${name}`)
      somethingDeleted = true
    }

    if (key) {
      console.log(`Deleting telepathChannelKey-${name}`)
      await SecureStore.deleteItemAsync(`telepathChannelKey-${name}`)
      somethingDeleted = true
    }

    if (appName) {
      console.log(`Deleting telepathChannelAppName-${name}`)
      await SecureStore.deleteItemAsync(`telepathChannelAppName-${name}`)
      somethingDeleted = true
    }

    if (clientId) {
      console.log(`Deleting telepathChannelClientId-${name}`)
      await SecureStore.deleteItemAsync(`telepathChannelClientId-${name}`)
      somethingDeleted = true
    }

    if (servicePointId) {
      console.log(`Deleting telepathChannelServicePointId-${name}`)
      await SecureStore.deleteItemAsync(`telepathChannelServicePointId-${name}`)
      somethingDeleted = true
    }

    if (!somethingDeleted) {
      console.log('[!!] Already upgraded!')
    }
    console.log(`Finished upgrading from Telepath to Rendezvous for telepath name: ${name}.`)
  }

  static reset = async name => {
    await SecureStore.deleteItemAsync(`rendezvousUrl-${name}`)
  }

  static recall = async name => {
    const url = await SecureStore.getItemAsync(`rendezvousUrl-${name}`)

    return {
      url
    }
  }

  static recallLegacy = async name => {
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

  constructor (name, url) {
    this.name = name
    this.url = url
  }

  hasConfiguration = () => {
    return this.url
  }

  set = async ({ url }) => {
    if (!url) {
      throw new Error('missing rendezvous url')
    }
    console.log(`setting rendezvous url for the configuration with name <<${this.name}>>`)
    await this.remember({ url })
  }

  get = async () => {
    if (this.hasConfiguration()) {
      return {
        url: this.url
      }
    }

    console.log(`No active rendezvous configuration with name ${this.name}. Restoring...`)

    const { url } = await MultiRendezvousConfiguration.recall(this.name)

    if (url === null) {
      console.log(`Restoring configuration with name ${this.name} failed.`)
      console.log(`Did you ever create a configuration with name <<${this.name}>>?`)
      return {}
    }

    console.log('Restoring succeeded.')

    return {
      url
    }
  }

  configurationChanged = ({ url }) => {
    return (this.url !== url)
  }

  remember = async ({ url }) => {
    if (this.configurationChanged({ url })) {
      this.url = url
      await SecureStore.setItemAsync(`rendezvousUrl-${this.name}`, this.url)
    }
  }
}

export { MultiRendezvousConfiguration }
