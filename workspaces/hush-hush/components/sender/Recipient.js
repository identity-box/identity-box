import React, { useState, useEffect } from 'react'
import { FadingValueBox } from '../animations'
import { InfoBox, MrSpacer, Blue, Green, Centered } from '../ui'

const Recipient = ({ onRecipientReady, telepathChannel }) => {
  const [currentDid, setCurrentDid] = useState(undefined)

  const requestCurrentDid = async () => {
    const message = {
      jsonrpc: '2.0',
      method: 'get_current_identity',
      params: []
    }
    try {
      await telepathChannel.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

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

  const process = message => {
    console.log('received message: ', message)
    const { method, params } = message
    if (params && params.length > 0) {
      if (method === 'select_identity_response') {
        const { did } = params[0]
        did && onRecipientReady && onRecipientReady({ did, currentDid })
      } else if (method === 'get_current_identity_response') {
        const { currentDid } = params[0]
        setCurrentDid(currentDid)
        requestRecipient()
      }
    }
  }

  useEffect(() => {
    const subscription = telepathChannel.subscribe(process, error => {
      console.log('error: ', error)
    })
    requestCurrentDid()
    return () => {
      telepathChannel.unsubscribe(subscription)
    }
  }, [currentDid])

  if (currentDid) {
    return (
      <FadingValueBox>
        <Centered>
          <InfoBox>
            Your current <Green>DID</Green> is:
          </InfoBox>
          <InfoBox marginTop='15px'>
            <Blue>{currentDid}</Blue>
          </InfoBox>
          <MrSpacer space='50px' />
          <InfoBox>
            Please select the intended recipient from the address book on your <Blue>IdApp</Blue>...
          </InfoBox>
        </Centered>
      </FadingValueBox>
    )
  } else {
    return (
      <FadingValueBox>
        <Centered>
          <InfoBox>Hush Hush <Green>successfully</Green> connected to your mobile!</InfoBox>
          <MrSpacer space='50px' />
          <InfoBox>Now, Hush Hush is retrieving your current identity from your mobile app....</InfoBox>
          <MrSpacer space='50px' />
          <InfoBox>
            Please make sure that your Identity Box IdApp is <Green>open</Green>.
          </InfoBox>
        </Centered>
      </FadingValueBox>
    )
  }
}

export { Recipient }
