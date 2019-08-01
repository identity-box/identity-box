import Constants from 'expo-constants'
import { Telepath } from '@identity-box/telepath'

import { randomBytes } from 'src/crypto'

import { TelepathConfiguration } from './TelepathConfiguration'

let _instance = null

class TelepathProvider {
  channel
  connected = false

  static instance = async channelDescription => {
    if (!_instance) {
      console.log('TelepathProvider: creating new instance...')
      _instance = new TelepathProvider()
    }
    if (!_instance.connected) {
      await _instance.connect(channelDescription)
    }
    return _instance
  }

  connect = async channelDescription => {
    const telepathConfiguration = await TelepathConfiguration.instance(channelDescription)
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
    this.channel = telepath.createChannel(telepathConfiguration.get())
    this.channel.describe({
      baseUrl: 'https://idbox.now.sh'
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
}

export { TelepathProvider }
