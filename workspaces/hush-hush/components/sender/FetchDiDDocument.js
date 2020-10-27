import React, { useCallback } from 'react'
import { FadingValueBox } from '../animations'
import { Blue, InfoBox, MrSpacer, Centered } from '../ui'

import { useRendezvous } from '../rendezvous'

const FetchDidDocument = ({ onDIDDocumentRetrieved, did, baseUrl }) => {
  const getDIDDocument = async rendezvousConnection => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'get-did-document',
      params: [{
        did
      }]
    }
    try {
      await rendezvousConnection.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const onReady = useCallback(async rendezvousConnection => {
    await getDIDDocument(rendezvousConnection)
  }, [])

  useRendezvous({
    url: baseUrl,
    onReady: onReady,
    onMessage: message => {
      if (message.method === 'get-did-document-response' && message.params.length > 0) {
        onDIDDocumentRetrieved && onDIDDocumentRetrieved(message.params[0])
      }
    },
    onError: error => {
      console.log(error)
    }
  })

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>Retrieving DID Document for the recipient with did:</InfoBox>
        <MrSpacer space='50px' />
        <InfoBox><Blue>{did}</Blue></InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { FetchDidDocument }
