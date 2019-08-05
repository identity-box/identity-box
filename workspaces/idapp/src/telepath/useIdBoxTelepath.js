import { useEffect, useRef } from 'react'
import { AsyncStorage } from 'react-native'
import { MultiTelepathProvider } from './MultiTelepathProvider'
import { MultiTelepathConfiguration } from './MultiTelepathConfiguration'

const useIdBoxTelepath = ({
  name,
  reset,
  channelDescription,
  onMessage,
  onError,
  onTelepathReady
} = {}, deps = []) => {
  const telepathProvider = useRef(undefined)
  const subscription = useRef(undefined)

  const subscribe = async () => {
    try {
      if (reset) {
        await AsyncStorage.removeItem('identityNames')
        await MultiTelepathConfiguration.reset(name)
      }
      telepathProvider.current = await MultiTelepathProvider.instance(name)
      if (!telepathProvider.current.connected) {
        await telepathProvider.current.connect(channelDescription)
      }
      if (onMessage) {
        console.log('subscribing...')
        subscription.current = telepathProvider.current.subscribe(onMessage, onError)
        console.log('ok')
      }
      onTelepathReady && onTelepathReady()
    } catch (e) {
      console.log(e.message)
      onError && onError(e)
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

export { useIdBoxTelepath }
