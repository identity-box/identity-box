import React, { useCallback } from 'react'
import { FadingValueBox } from '../animations'
import { Blue, InfoBox, MrSpacer, Centered } from '../ui'

import { useTelepath } from '../telepath'

const SenderPublicKey = ({ next, did }) => {
  const getDIDDocument = async (telepathProvider) => {
    const message = {
      jsonrpc: '2.0',
      servicePath: 'identity-box.identity-service',
      from: telepathProvider.clientId,
      method: 'get-did-document',
      params: [{
        did
      }]
    }
    try {
      await telepathProvider.emit(message, {
        to: telepathProvider.servicePointId
      })
    } catch (e) {
      console.log(e.message)
    }
  }

  const onTelepathReady = useCallback(async ({ telepathProvider }) => {
    await getDIDDocument(telepathProvider)
  }, [])

  useTelepath({
    name: 'idbox',
    onTelepathReady: onTelepathReady,
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
