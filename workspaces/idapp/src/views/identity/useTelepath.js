import { useEffect, useRef } from 'react'
import Constants from 'expo-constants'
import { Buffers } from '@react-frontend-developer/buffers'
import base64url from 'base64url'
import { Telepath } from '@identity-box/telepath'

import { randomBytes } from 'src/crypto'

// The channel description for the app comes from one of the config files.
// Before starting the app make sure to create a valid config file
// with the channel data that you want to use. Please
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
const getChannelDescription = () => {
  const {
    id,
    key,
    appName,
    clientId
  } = Constants.manifest.extra.telepathChannel
  return {
    id,
    key: Buffers.copyToUint8Array(base64url.toBuffer(key)),
    appName,
    clientId
  }
}

const useTelepath = (onMessage, onError) => {
  const channel = useRef(undefined)
  const subscription = useRef(undefined)

  const subscribe = async () => {
    console.log('subscribing...')
    try {
      subscription.current = await channel.current.subscribe(onMessage, onError)
    } catch (e) {
      console.log(e)
    }
  }

  const unsubscribe = () => {
    if (subscription.current) {
      channel.current.unsubscribe(subscription.current)
    }
  }

  const connect = async () => {
    const telepath = new Telepath({
      serviceUrl: Constants.manifest.extra.queuingServiceUrl,
      randomBytes
    })
    channel.current = telepath.createChannel(getChannelDescription())
    channel.current.describe({
      baseUrl: 'https://idbox.now.sh'
    })

    subscribe()
  }

  useEffect(() => {
    console.log('Opening telepath channel')

    connect()

    return () => {
      console.log('unsubscribing...')
      unsubscribe()
    }
  }, [])

  return channel.current
}

export { useTelepath }
