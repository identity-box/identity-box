import { useEffect, useRef } from 'react'
import { AsyncStorage } from 'react-native'
import { RendezvousClient } from '@identity-box/rendezvous-client'

import { MultiRendezvousConfiguration } from './MultiRendezvousConfiguration'
import { randomBytes } from 'src/crypto'

const useRendezvous = ({
  name,
  url,
  onReady,
  onMessage,
  onEnd,
  onError,
  reset
} = {}, deps = []) => {
  const rendezvousClient = useRef(undefined)
  const rendezvousConnection = useRef(undefined)

  const getUrl = async () => {
    const rendezvousConfigurationProvider = await MultiRendezvousConfiguration.instance(name)
    const { url } = await rendezvousConfigurationProvider.get()

    if (!url) {
      throw new Error(`Cannot connect! Missing rendezvous configuration with name ${name}`)
    }

    return url
  }

  const startRendezvous = async () => {
    try {
      if (reset) {
        await AsyncStorage.removeItem('identityNames')
        await MultiRendezvousConfiguration.reset(name)
      }

      let baseUrl = url
      if (!baseUrl) {
        baseUrl = await getUrl()
      }
      console.log('baseUrl=', baseUrl)
      rendezvousClient.current = new RendezvousClient({
        baseUrl,
        onMessage: msg => {
          console.log('msg response:', msg)
          onMessage && onMessage(msg)
        },
        onSessionEnded: reason => {
          console.log('Session ended:', reason)
          onEnd && onEnd(reason)
        },
        prng: randomBytes
      })

      rendezvousConnection.current = await rendezvousClient.current.connect()

      onReady && onReady(rendezvousConnection.current)
    } catch (e) {
      console.log(e.message)
      onError && onError(e)
    }
  }

  const unsubscribe = () => {
    rendezvousConnection.current && rendezvousConnection.current.end()
  }

  useEffect(() => {
    if (name) {
      startRendezvous()
    }
    return () => {
      unsubscribe()
    }
  }, deps)

  return rendezvousConnection.current
}

export { useRendezvous }
