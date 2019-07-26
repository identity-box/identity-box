import { useEffect, useRef } from 'react'
import { TelepathProvider } from './TelepathProvider'

const useTelepath = (onMessage, onError) => {
  const telepathProvider = useRef(undefined)
  const subscription = useRef(undefined)

  const subscribe = async () => {
    telepathProvider.current = await TelepathProvider.instance()
    if (onMessage) {
      console.log('subscribing...')
      subscription.current = telepathProvider.current.subscribe(onMessage, onError)
      console.log('ok')
    }
  }

  const unsubscribe = () => {
    if (telepathProvider.current && subscription.current !== undefined) {
      console.log('unsubscribing...')
      telepathProvider.current.unsubscribe(subscription.current)
    }
  }

  useEffect(() => {
    subscribe()

    return () => {
      unsubscribe()
    }
  }, [])

  return telepathProvider.current
}

export { useTelepath }
