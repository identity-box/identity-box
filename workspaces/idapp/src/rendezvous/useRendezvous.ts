import { useEffect, useRef, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  RendezvousClient,
  RendezvousClientConnection
} from '@identity-box/rendezvous-client'
import type { RendezvousMessage } from '@identity-box/rendezvous-client'

import { MultiRendezvousConfiguration } from './MultiRendezvousConfiguration'
import { randomBytes } from '../crypto'

type UseRendezvousDescriptor = {
  name: string
  url?: string
  onReady?: (connection: RendezvousClientConnection) => void
  onMessage?: (msg: RendezvousMessage) => void
  onEnd?: (reason: string) => void
  onError?: (error: Error) => void
  reset: boolean
}

const useRendezvous = ({
  name,
  url,
  onReady,
  onMessage,
  onEnd,
  onError,
  reset = false
}: UseRendezvousDescriptor) => {
  const rendezvousClient = useRef<RendezvousClient | undefined>(undefined)
  const rendezvousConnection = useRef<RendezvousClientConnection | undefined>(
    undefined
  )

  const getUrl = useCallback(async () => {
    const rendezvousConfigurationProvider =
      await MultiRendezvousConfiguration.instance(name)
    const { url } = await rendezvousConfigurationProvider.get()

    if (!url) {
      throw new Error(
        `Cannot connect! Missing rendezvous configuration with name <<${name}>>`
      )
    }

    return url
  }, [name])

  const startRendezvous = useCallback(async () => {
    try {
      if (reset) {
        await AsyncStorage.removeItem('identityNames')
        const rendezvousConfigurationProvider =
          await MultiRendezvousConfiguration.instance(name)
        await rendezvousConfigurationProvider.reset()
      }

      let baseUrl = url

      if (!baseUrl) {
        baseUrl = await getUrl()
      }
      console.log('baseUrl=', baseUrl)
      rendezvousClient.current = new RendezvousClient({
        baseUrl,
        onMessage: (msg) => {
          console.log('msg response:', msg)
          onMessage && onMessage(msg)
        },
        onSessionEnded: (reason) => {
          console.log('Session ended:', reason)
          onEnd && onEnd(reason)
        },
        prng: randomBytes
      })

      rendezvousConnection.current = await rendezvousClient.current.connect()

      onReady && onReady(rendezvousConnection.current)
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(e.message)
        onError && onError(e)
      } else {
        console.log('unknown error')
        onError && onError(new Error('unknown error'))
      }
    }
  }, [name, url, onReady, onMessage, onEnd, onError, reset, getUrl])

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
  }, [name, startRendezvous])

  return rendezvousConnection.current
}

export { useRendezvous }
