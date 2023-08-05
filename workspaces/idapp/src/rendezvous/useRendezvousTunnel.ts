import { useEffect, useRef } from 'react'
import { RendezvousTunnel } from '@identity-box/rendezvous-client'

import { GlobalRendezvousTunnelKeeper } from './GlobalRendezvousTunnelKeeper'
import type { RendezvousTunnelDescriptor } from './GlobalRendezvousTunnelKeeper'

type UseRendezvousTunnelDescriptor = Partial<
  Pick<RendezvousTunnelDescriptor, 'url' | 'tunnelId'>
> &
  Pick<
    RendezvousTunnelDescriptor,
    'onReady' | 'onMessage' | 'onEnd' | 'onError'
  >

const useRendezvousTunnel = (
  {
    url,
    tunnelId,
    onReady,
    onMessage,
    onEnd,
    onError
  }: UseRendezvousTunnelDescriptor,
  keepConnected = false
) => {
  const rendezvousTunnel = useRef<RendezvousTunnel | undefined>(undefined)

  useEffect(() => {
    const startRendezvous = async ({
      url,
      tunnelId
    }: {
      url: string
      tunnelId: string
    }) => {
      try {
        const tunnelDescriptor = {
          url,
          tunnelId,
          onReady,
          onMessage,
          onEnd,
          onError
        }
        console.log('baseUrl=', url)
        rendezvousTunnel.current = GlobalRendezvousTunnelKeeper.instance({
          url,
          tunnelId
        })
        if (!rendezvousTunnel.current) {
          console.log('creating new tunnel instance!')
          rendezvousTunnel.current =
            GlobalRendezvousTunnelKeeper.createNewTunnelInstance(
              tunnelDescriptor
            )
          console.log('connecting...')
          GlobalRendezvousTunnelKeeper.connect(tunnelDescriptor)
        }
        return rendezvousTunnel.current
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.log(e.message)
          throw e
        } else {
          console.log('unknown error')
          throw new Error('unknown error')
        }
      }
    }

    const unsubscribe = () => {
      if (url && tunnelId) {
        console.log('UNSUBSRIBING!')
        GlobalRendezvousTunnelKeeper.disconnect({ url, tunnelId })
      }
    }

    if (url && tunnelId) {
      startRendezvous({ url, tunnelId })
    }
    return () => {
      if (keepConnected) return
      unsubscribe()
    }
  }, [tunnelId, url, onReady, onMessage, onEnd, onError, keepConnected])

  return rendezvousTunnel.current
}

export { useRendezvousTunnel }
