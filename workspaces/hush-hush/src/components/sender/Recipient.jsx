import { useState, useEffect, useCallback } from 'react'
import { FadingValueBox } from '../animations'
import { InfoBox, MrSpacer, Blue, Green, Red, Centered } from '../ui'

const Recipient = ({ onRecipientReady, rendezvousTunnel }) => {
  const [currentDid, setCurrentDid] = useState(undefined)
  const [errorID, setErrorID] = useState(undefined)

  const requestCurrentDid = useCallback(async () => {
    const message = {
      method: 'get_current_identity',
      params: []
    }
    try {
      await rendezvousTunnel.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }, [rendezvousTunnel])

  const requestRecipient = useCallback(async () => {
    const message = {
      method: 'select_identity',
      params: []
    }
    try {
      await rendezvousTunnel.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }, [rendezvousTunnel])

  const process = useCallback(
    (message) => {
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
        } else if (method === 'tunnel-message-decrypt-error') {
          const { errorID } = params[0]
          console.log('errorID=', errorID)
          setErrorID(errorID)
        }
      }
    },
    [currentDid, onRecipientReady, requestRecipient]
  )

  useEffect(() => {
    rendezvousTunnel.onMessage = process
    if (currentDid === undefined) {
      requestCurrentDid()
    }
    return () => {
      rendezvousTunnel.onMessage = undefined
    }
  }, [process, currentDid, rendezvousTunnel, requestCurrentDid])

  if (errorID) {
    return (
      <FadingValueBox>
        <Centered>
          <InfoBox>Something did not went well:</InfoBox>
          <InfoBox css='mt-[15px]'>
            <Red>{errorID}</Red>
          </InfoBox>
          <MrSpacer space='50px' />
          <InfoBox>
            Please record the above mentioned error message and contact us. We
            will try our best to help.
          </InfoBox>
        </Centered>
      </FadingValueBox>
    )
  }

  if (currentDid) {
    return (
      <FadingValueBox>
        <Centered>
          <InfoBox>
            Your current <Green>DID</Green> is:
          </InfoBox>
          <InfoBox css='mt-[15px]'>
            <Blue>{currentDid}</Blue>
          </InfoBox>
          <MrSpacer space='50px' />
          <InfoBox>
            Please select the intended recipient from the address book on your{' '}
            <Blue>IdApp</Blue>...
          </InfoBox>
        </Centered>
      </FadingValueBox>
    )
  } else {
    return (
      <FadingValueBox>
        <Centered>
          <InfoBox>
            Hush Hush <Green>successfully</Green> connected to your mobile!
          </InfoBox>
          <MrSpacer space='50px' />
          <InfoBox>
            Now, Hush Hush is retrieving your current identity from your mobile
            app....
          </InfoBox>
          <MrSpacer space='50px' />
          <InfoBox>
            Please make sure that your Identity Box IdApp is <Green>open</Green>
            .
          </InfoBox>
        </Centered>
      </FadingValueBox>
    )
  }
}

export { Recipient }
