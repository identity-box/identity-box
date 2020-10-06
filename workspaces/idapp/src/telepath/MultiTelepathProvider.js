import Constants from 'expo-constants'
import { Telepath } from '@identity-box/telepath'

import { randomBytes } from 'src/crypto'

import { MultiTelepathConfiguration } from './MultiTelepathConfiguration'

const _instances = {}

class MultiTelepathProvider {
  name

  channel

  connected = false

  get servicePointId () {
    return this.channel.servicePointId
  }

  get clientId () {
    return this.channel.clientId
  }

  static instance = async name => {
    if (!_instances[name]) {
      console.log(`MultiTelepathProvider: creating new provider instance for name: ${name}...`)
      _instances[name] = new MultiTelepathProvider(name)
    }
    return _instances[name]
  }

  constructor (name) {
    this.name = name
  }

  connect = async channelDescription => {
    const telepathConfigurationProvider = await MultiTelepathConfiguration.instance(this.name)
    if (channelDescription) {
      await telepathConfigurationProvider.set(channelDescription)
    }

    const telepathConfiguration = await telepathConfigurationProvider.get()

    if (!telepathConfiguration) {
      throw new Error(`Cannot connect! Missing telepath configuration with name ${this.name}`)
    }
    // The queuing service url (queuingServiceUrl) for the app comes from one of the config files.
    // Before starting the app make sure to create a valid config file
    // with the configuration that you want to use. Please
    // take a look at one of the existing configuration files (`*.config.js`).
    // All the constants from the config file will be added to `app.json`
    // under the `extra` key. The `app.json` is created by adding this
    // `extra` key to the contents of the `config.json`.
    // Therefore before running `yarn expo start` or any other expo command,
    // please make sure you select the correct configuration by
    // running `expo-env --env=<your-configuration>`. This will properly
    // populate the `extra` entry of the `app.json` making it visible
    // to the app via `Constants.manifest.extra`.
    // For more information check [expo-env](https://www.npmjs.com/package/expo-env).
    const telepath = new Telepath({
      serviceUrl: Constants.manifest.extra.queuingServiceUrl,
      randomBytes
    })
    this.channel = telepath.createChannel(telepathConfiguration)
    this.channel.describe({
      baseUrl: 'https://idbox.online'
    })

    await this.channel.connect()
    this.connected = true
  }

  subscribe = (onMessage, onError) => {
    return this.channel.subscribe(onMessage, onError)
  }

  unsubscribe = subscription => {
    this.channel.unsubscribe(subscription)
  }

  emit = async (message, params) => {
    await this.channel.emit(message, params)
  }
}

export { MultiTelepathProvider }
