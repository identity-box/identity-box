import { useEffect, useRef } from 'react'
import { RendezvousClient } from '@identity-box/rendezvous-client'

const useRendezvous = ({
  url,
  onReady,
  onMessage,
  onEnd,
  onError,
  reset
} = {}, deps = []) => {
  const rendezvousClient = useRef(undefined)
  const rendezvousConnection = useRef(undefined)

  const startRendezvous = async () => {
    try {
      console.log('baseUrl=', url)
      rendezvousClient.current = new RendezvousClient({
        baseUrl: url,
        onMessage: msg => {
          console.log('msg response:', msg)
          onMessage && onMessage(msg)
        },
        onSessionEnded: reason => {
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
  }

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
  }, deps)

  return rendezvousConnection.current
}

export { useRendezvous }
