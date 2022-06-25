import React, { useCallback } from 'react'
import { FadingValueBox } from '../animations'
import { Blue, InfoBox, MrSpacer, Centered } from '../ui'

import { useRendezvous } from '../rendezvous'

const SenderPublicKey = ({ next, did, baseUrl }) => {
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
    onReady,
    onMessage: message => {
      if (message.method === 'get-did-document-response' && message.params.length > 0) {
        const didDocument = message.params[0]

        next && next(didDocument)
      }
    },
    onError: error => {
      console.log(error)
    }
  })

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>Retrieving DID Document for the identity with did:</InfoBox>
        <MrSpacer space='50px' />
        <InfoBox><Blue>{did}</Blue></InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { SenderPublicKey }
