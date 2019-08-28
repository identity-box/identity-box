import React, { useCallback } from 'react'

import { FadingValueBox } from '../animations'
import { Blue, Green, InfoBox, Centered, MrSpacer } from '../ui'

import { useTelepath } from '../telepath'

const FetchSecret = ({ next, cid }) => {
  const getJSON = async (telepathProvider) => {
    const message = {
      jsonrpc: '2.0',
      method: 'get-json',
      params: [{
        cid
      }, {
        from: telepathProvider.clientId
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
    await getJSON(telepathProvider)
  }, [])

  useTelepath({
    name: 'idbox',
    onTelepathReady: onTelepathReady,
    onMessage: message => {
      if (message.method === 'get-json-response' && message.params.length > 0) {
        const { json } = message.params[0]
        next && next(json)
      }
    },
    onError: error => {
      console.log(error)
    }
  })

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>Fetching <Green>encrypted secret</Green> with <Blue>CID:</Blue></InfoBox>
        <MrSpacer space='15px' />
        <InfoBox><Blue>{cid}</Blue></InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { FetchSecret }
