import React, { useEffect, useRef } from 'react'
import { Header } from 'semantic-ui-react'
import {
  Centered,
  Spacer
} from '@react-frontend-developer/react-layout-helpers'
import { IdAppQRCode } from '../IdAppQRCode'

const ConnectorBody = ({ telepathChannel, onDone, connectUrl }) => {
  const subscription = useRef(undefined)

  const subscribeToTelepath = () => {
    subscription.current = telepathChannel.subscribe(
      message => {
        if (message.method === 'connectionSetupDone') {
          telepathChannel.unsubscribe(subscription.current)
          onDone()
        }
      }
    )
  }

  useEffect(() => {
    subscribeToTelepath()
    return () => {
      telepathChannel.unsubscribe(subscription.current)
    }
  }, [])

  useEffect(() => {
    telepathChannel.unsubscribe(subscription.current)
    subscribeToTelepath()
  }, [telepathChannel, onDone])

  return (
    <Centered>
      <Header>Please scan the QR code below with your mobile device.</Header>
      <Spacer
        margin='20px 0 50px 0'
        render={() => <IdAppQRCode key={connectUrl} connectUrl={connectUrl} />}
      />
    </Centered>
  )
}
export { ConnectorBody }
