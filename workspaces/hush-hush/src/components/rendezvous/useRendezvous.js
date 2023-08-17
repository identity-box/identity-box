import { useCallback, useEffect, useRef } from 'react'
import { RendezvousClient } from '@identity-box/rendezvous-client'

const useRendezvous = ({ url, onReady, onMessage, onEnd, onError } = {}) => {
  const rendezvousClient = useRef(undefined)
  const rendezvousConnection = useRef(undefined)

  const startRendezvous = useCallback(async () => {
    try {
      console.log('baseUrl=', url)
      rendezvousClient.current = new RendezvousClient({
        baseUrl: url,
        onMessage: (msg) => {
          console.log('msg response:', msg)
          onMessage && onMessage(msg)
        },
        onSessionEnded: (reason) => {
          console.log('Session ended:', reason)
          onEnd && onEnd(reason)
        }
      })

      rendezvousConnection.current = await rendezvousClient.current.connect()

      onReady && onReady(rendezvousConnection.current)
    } catch (e) {
      console.log(e.message)
      onError && onError(e)
    }
  }, [url, onReady, onMessage, onEnd, onError])

  const unsubscribe = () => {
    rendezvousConnection.current && rendezvousConnection.current.end()
  }

  useEffect(() => {
    if (url) {
      startRendezvous()
    }
    return () => {
      unsubscribe()
    }
  }, [startRendezvous, url])

  return rendezvousConnection.current
}

export { useRendezvous }
