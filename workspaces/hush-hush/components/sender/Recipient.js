import React, { useEffect } from 'react'
import { FadingValueBox } from '../animations'
import { Blue, InfoBox, MrSpacer, Green, Centered } from '../ui'

const Recipient = ({ onRecipientReady, telepathChannel }) => {
  const requestRecipient = async () => {
    const message = {
      jsonrpc: '2.0',
      method: 'select_identity',
      params: []
    }
    try {
      await telepathChannel.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  useEffect(() => {
    const subscription = telepathChannel.subscribe(message => {
      console.log('received message: ', message)
      const { method, params } = message
      if (method === 'set_did' && params) {
        if (params.length > 0) {
          const { did } = params[0]
          did && onRecipientReady && onRecipientReady({ did })
        }
      }
    }, error => {
      console.log('error: ', error)
    })
    requestRecipient()
    return () => {
      telepathChannel.unsubscribe(subscription)
    }
  }, [])

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>Hush Hush <Green>successfully</Green> connected to your mobile!</InfoBox>
        <MrSpacer space='50px' />
        <InfoBox>
          Open Identity Box IdApp <Blue>now</Blue>, and select the recipient...
        </InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { Recipient }
