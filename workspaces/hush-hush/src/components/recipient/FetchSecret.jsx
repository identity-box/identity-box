import { useCallback } from 'react'

import { FadingValueBox } from '../animations'
import { Blue, Green, InfoBox, Centered, MrSpacer } from '../ui'

import { useRendezvous } from '../rendezvous'

const FetchSecret = ({ next, cid, baseUrl }) => {
  const getJSON = useCallback(
    async (rendezvousConnection) => {
      const message = {
        servicePath: 'identity-box.identity-service',
        method: 'get-json',
        params: [
          {
            cid
          }
        ]
      }
      try {
        await rendezvousConnection.send(message)
      } catch (e) {
        console.log(e.message)
      }
    },
    [cid]
  )

  const onReady = useCallback(
    async (rendezvousConnection) => {
      await getJSON(rendezvousConnection)
    },
    [getJSON]
  )

  const onMessage = useCallback(
    (message) => {
      if (message.method === 'get-json-response' && message.params.length > 0) {
        const { json } = message.params[0]
        next && next(json)
      }
    },
    [next]
  )

  const onError = useCallback((error) => {
    console.log(error)
  }, [])

  useRendezvous({
    url: baseUrl,
    onReady,
    onMessage,
    onError
  })

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>
          Fetching <Green>encrypted secret</Green> with <Blue>CID:</Blue>
        </InfoBox>
        <MrSpacer space='15px' />
        <InfoBox>
          <Blue>{cid}</Blue>
        </InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { FetchSecret }
