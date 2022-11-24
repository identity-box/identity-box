import { useCallback } from 'react'
import { FadingValueBox } from '../animations'
import { Blue, InfoBox, MrSpacer, Centered } from '../ui'

import { useRendezvous } from '../rendezvous'

const SenderPublicKey = ({ next, did, baseUrl }) => {
  const getDIDDocument = useCallback(
    async (rendezvousConnection) => {
      const message = {
        servicePath: 'identity-box.identity-service',
        method: 'get-did-document',
        params: [
          {
            did
          }
        ]
      }
      try {
        await rendezvousConnection.send(message)
      } catch (e) {
        console.log(e.message)
      }
    },
    [did]
  )

  const onReady = useCallback(
    async (rendezvousConnection) => {
      await getDIDDocument(rendezvousConnection)
    },
    [getDIDDocument]
  )

  const onMessage = useCallback(
    (message) => {
      if (
        message.method === 'get-did-document-response' &&
        message.params.length > 0
      ) {
        const didDocument = message.params[0]

        next && next(didDocument)
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
        <InfoBox>Retrieving DID Document for the identity with did:</InfoBox>
        <MrSpacer space='50px' />
        <InfoBox>
          <Blue>{did}</Blue>
        </InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { SenderPublicKey }
