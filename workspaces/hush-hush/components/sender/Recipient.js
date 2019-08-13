import React, { useEffect } from 'react'
import { FadingValueBox } from '../animations'
import { Blue, InfoBox, MrSpacer, Green } from '../ui'
import { Centered } from '@react-frontend-developer/react-layout-helpers'

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
    telepathChannel.subscribe(message => {
      console.log('received message: ', message)
    }, error => {
      console.log('error: ', error)
    })
    requestRecipient()
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
