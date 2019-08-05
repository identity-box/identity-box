import { useEffect, useRef } from 'react'
import Constants from 'expo-constants'
import base64url from 'base64url'
import { Buffers } from '@react-frontend-developer/buffers'
import { Telepath } from '@identity-box/telepath'

import { randomBytes } from 'src/crypto'

// why 12? why not...
const clientIdEntropy = 12

const useTelepath = ({
  onMessage,
  onError,
  channelDescription,
  onTelepathReady
} = {}, deps = []) => {
  const channel = useRef(undefined)
  const subscription = useRef(undefined)

  const createClientId = async () => {
    const clientIdBytes = await randomBytes(clientIdEntropy)
    return base64url.encode(clientIdBytes)
  }

  const subscribe = async () => {
    try {
      const clientId = await createClientId()
      const telepath = new Telepath({
        serviceUrl: Constants.manifest.extra.queuingServiceUrl,
        randomBytes
      })
      channel.current = telepath.createChannel({
        id: channelDescription.id,
        key: Buffers.copyToUint8Array(base64url.toBuffer(channelDescription.key)),
        appName: base64url.decode(channelDescription.appName),
        clientId
      })
      channel.current.describe({
        baseUrl: 'https://idbox.now.sh'
      })

      await channel.current.connect()

      if (onMessage) {
        console.log('subscribing...')
        subscription.current = channel.current.subscribe(onMessage, onError)
        console.log('ok')
      }
      onTelepathReady && onTelepathReady()
    } catch (e) {
      console.log(e.message)
      onError && onError(e)
    }
  }

  const unsubscribe = () => {
    if (channel.current && subscription.current !== undefined) {
      console.log('unsubscribing...')
      channel.current.unsubscribe(subscription.current)
    }
  }

  useEffect(() => {
    subscribe()

    return () => {
      unsubscribe()
    }
  }, deps)

  return channel.current
}

export { useTelepath }
