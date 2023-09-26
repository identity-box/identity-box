import { useCallback, useEffect, useRef } from 'react'
import { RendezvousTunnel } from '@identity-box/rendezvous-client'

const useRendezvousTunnel = ({
  url,
  onCreated,
  onReady,
  onOtherEndNotReady,
  onMessage,
  onEnd,
  onError
} = {}) => {
  const rendezvousTunnel = useRef(undefined)
  const tunnelId = useRef(undefined)
  const tunnelUrl = useRef(undefined)

  const startRendezvous = useCallback(async () => {
    try {
      console.log('baseUrl=', url)
      rendezvousTunnel.current = new RendezvousTunnel({
        baseUrl: url,
        onMessage: (msg) => {
          console.log('msg response:', msg)
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

      const { tunnelId: tId, tunnelUrl: tUrl } =
        await rendezvousTunnel.current.createNew()
      tunnelId.current = tId
      tunnelUrl.current = tUrl
      onCreated &&
        onCreated({
          rendezvousTunnel: rendezvousTunnel.current,
          rendezvousTunnelId: tunnelId.current,
          rendezvousTunnelUrl: tunnelUrl.current
        })
    } catch (e) {
      console.log(e.message)
      onError && onError(e)
    }
  }, [url, onCreated, onReady, onOtherEndNotReady, onMessage, onEnd, onError])

  const unsubscribe = () => {
    rendezvousTunnel.current && rendezvousTunnel.current.closeTunnel()
  }

  useEffect(() => {
    if (url) {
      startRendezvous()
    }
    return () => {
      unsubscribe()
    }
  }, [url, startRendezvous])

  return {
    rendezvousTunnel: rendezvousTunnel.current,
    rendezvousUrl: tunnelUrl.current
  }
}

export { useRendezvousTunnel }
