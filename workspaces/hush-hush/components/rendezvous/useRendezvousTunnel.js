import { useEffect, useRef } from 'react'
import { RendezvousTunnel } from '@identity-box/rendezvous-client'

const useRendezvousTunnel = ({
  url,
  onCreated,
  onReady,
  onOtherEndNotReady,
  onMessage,
  onEnd,
  onError
} = {}, deps = []) => {
  const rendezvousTunnel = useRef(undefined)
  const tunnelId = useRef(undefined)
  const tunnelUrl = useRef(undefined)

  const startRendezvous = async () => {
    try {
      console.log('baseUrl=', url)
      rendezvousTunnel.current = new RendezvousTunnel({
        baseUrl: url,
        onMessage: msg => {
          console.log('msg response:', msg)
          // rendezvousTunnel.current.closeTunnel()
          onMessage && onMessage(msg)
        },
        onTunnelReady: () => {
          onReady && onReady(tunnelId.current)
        },
        onOtherEndNotReady: () => {
          onOtherEndNotReady && onOtherEndNotReady()
        },
        onTunnelClosed: async () => {
          console.log('Tunnel closed!')
          onEnd && onEnd()
        }
      })

      const { tunnelId: tId, tunnelUrl: tUrl } = await rendezvousTunnel.current.createNew()
      tunnelId.current = tId
      tunnelUrl.current = tUrl
      onCreated && onCreated({
        rendezvousTunnel: rendezvousTunnel.current,
        rendezvousTunnelId: tunnelId.current,
        rendezvousTunnelUrl: tunnelUrl.current
      })
    } catch (e) {
      console.log(e.message)
      onError && onError(e)
    }
  }

  const unsubscribe = () => {
    console.log('I WILL do rendezvousTunnel.current.closeTunnel()!!!!')
    // rendezvousTunnel.current && rendezvousTunnel.current.closeTunnel()
  }

  useEffect(() => {
    if (url) {
      startRendezvous()
    }
    return () => {
      unsubscribe()
    }
  }, deps)

  return {
    rendezvousTunnel: rendezvousTunnel.current,
    rendezvousUrl: tunnelUrl.current
  }
}

export { useRendezvousTunnel }
