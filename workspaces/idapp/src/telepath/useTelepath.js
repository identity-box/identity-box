import { useEffect, useRef } from 'react'
import { TelepathProvider } from './TelepathProvider'

const useTelepath = ({
  onMessage,
  onError,
  channelDescription,
  onTelepathReady,
  onMissingTelepathConfiguration
} = {}, deps = []) => {
  const telepathProvider = useRef(undefined)
  const subscription = useRef(undefined)

  const subscribe = async () => {
    try {
      telepathProvider.current = await TelepathProvider.instance(channelDescription)
      if (onMessage) {
        console.log('subscribing...')
        subscription.current = telepathProvider.current.subscribe(onMessage, onError)
        console.log('ok')
      }
      onTelepathReady && onTelepathReady()
    } catch (e) {
      console.log(e.message)
      onMissingTelepathConfiguration && onMissingTelepathConfiguration(e)
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
  }, deps)

  return telepathProvider.current
}

export { useTelepath }
