import React, { useCallback } from 'react'

import { FadingValueBox } from '../animations'
import { Blue, Green, InfoBox, Centered, MrSpacer } from '../ui'

import { useRendezvous } from '../rendezvous'

const FetchSecret = ({ next, cid, baseUrl }) => {
  const getJSON = async rendezvousConnection => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'get-json',
      params: [{
        cid
      }]
    }
    try {
      await rendezvousConnection.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const onReady = useCallback(async rendezvousConnection => {
    await getJSON(rendezvousConnection)
  }, [])

  useRendezvous({
    url: baseUrl,
    onReady,
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
