import React, { useEffect, useCallback, useRef } from 'react'
import base64url from 'base64url'
import styled from '@emotion/native'
import { Button } from 'react-native'
import { Buffers } from '@react-frontend-developer/buffers'
import * as Random from 'expo-random'
import Constants from 'expo-constants'

import { Telepath } from '@identity-box/telepath'

const randomBytes = byteCount => {
  return Random.getRandomBytesAsync(byteCount)
}

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

const Container = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5FCFF'
})

const Welcome = styled.Text({
  fontSize: 20,
  textAlign: 'center',
  margin: 10
})

const Main = () => {
  const onPressCallback = useCallback(
    async () => {
      console.log('Creating identity...')
      const message = {
        jsonrpc: '2.0',
        method: 'test',
        params: [
          1,
          'some string',
          {
            a: 'an object',
            b: 2
          }
        ]
      }
      try {
        await channel.current.emit(message)
      } catch (e) {
        console.log(e.message)
      }
    },
    []
  )

  const channel = useRef(undefined)
  const subscription = useRef(undefined)

  const subscribe = async () => {
    console.log('subscribing...')
    try {
      subscription.current = await channel.current.subscribe(message => {
        console.log('received message: ', message)
      }, error => {
        console.log('error: ', error)
      })
    } catch (e) {
      console.log(e)
    }
  }

  const unsubscribe = () => {
    if (subscription.current) {
      channel.current.unsubscribe(subscription.current)
    }
  }

  const establishConnectionWithIdBox = async () => {
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

    establishConnectionWithIdBox()

    return () => {
      console.log('unsubscribing...')
      unsubscribe()
    }
  }, [])

  return (
    <Container>
      <Welcome>Create your first identity</Welcome>
      <Button
        onPress={onPressCallback}
        title='Create...'
        accessibilityLabel='Create an identity...'
      />
    </Container>
  )
}

export { Main }
