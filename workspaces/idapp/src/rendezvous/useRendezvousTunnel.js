import { useEffect, useRef } from 'react'
import { RendezvousTunnel } from '@identity-box/rendezvous-client'

import { randomBytes } from 'src/crypto'

const useRendezvousTunnel = ({
  url,
  tunnelId,
  onReady,
  onMessage,
  onEnd,
  onError
} = {}, deps = []) => {
  const rendezvousTunnel = useRef(undefined)

  const startRendezvous = async () => {
    try {
      console.log('baseUrl=', url)
      rendezvousTunnel.current = new RendezvousTunnel({
        baseUrl: url,
        onMessage: msg => {
          console.log('msg response:', msg)
          onMessage && onMessage(msg)
        },
        onTunnelReady: () => {
          onReady && onReady(rendezvousTunnel.current)
        },
        onTunnelClosed: async () => {
          console.log('Tunnel closed!')
          onEnd && onEnd()
        },
        prng: randomBytes
      })

      await rendezvousTunnel.current.connectToExisting(tunnelId)
    } catch (e) {
      console.log(e.message)
      onError && onError(e)
    }
  }

  const unsubscribe = () => {
    console.log('UNSUBSRIBING!')
    rendezvousTunnel.current && rendezvousTunnel.current.closeLocalConnection()
  }

  useEffect(() => {
    if (url && tunnelId) {
      startRendezvous()
    }
    return () => {
      unsubscribe()
    }
  }, deps)

  return rendezvousTunnel.current
}

export { useRendezvousTunnel }
