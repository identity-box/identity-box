import React, { useState, useEffect, useCallback } from 'react'
import { FadingValueBox } from '../animations'
import { InfoBox, MrSpacer, Blue, Green, Centered } from '../ui'

const Recipient = ({ onRecipientReady, rendezvousTunnel }) => {
  const [currentDid, setCurrentDid] = useState(undefined)

  const requestCurrentDid = async () => {
    const message = {
      method: 'get_current_identity',
      params: []
    }
    try {
      await rendezvousTunnel.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const requestRecipient = async () => {
    const message = {
      method: 'select_identity',
      params: []
    }
    try {
      await rendezvousTunnel.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const process = useCallback(message => {
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
  }, [currentDid])

  useEffect(() => {
    rendezvousTunnel.onMessage = process
    if (currentDid === undefined) {
      requestCurrentDid()
    }
    return () => {
      rendezvousTunnel.onMessage = undefined
    }
  }, [process, currentDid])

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
