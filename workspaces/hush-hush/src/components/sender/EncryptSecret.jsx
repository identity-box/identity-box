import { useCallback, useState, useEffect, useRef } from 'react'
import nacl from 'tweetnacl'
import base64url from 'base64url'
import { TypedArrays } from '@react-frontend-developer/buffers'
import { FadingValueBox } from '../animations'
import { Red, MrSpacer, Blue, InfoBox, Centered } from '../ui'

import { useRendezvous } from '../rendezvous'

const EncryptSecret = ({
  onEncryptedCIDRetrieved,
  encryptionKey,
  secret,
  idappRendezvousTunnel,
  baseUrl
}) => {
  const [symmetricKey, setSymmetricKey] = useState(undefined)
  const [errorID, setErrorID] = useState(undefined)
  const rendezvousConnection = useRef(undefined)

  const storeJSON = async (json) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'store-json',
      params: [
        {
          json
        }
      ]
    }
    try {
      await rendezvousConnection.current.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const encryptSymmetricKey = useCallback(async () => {
    const symmetricKey = nacl.randomBytes(nacl.secretbox.keyLength)
    setSymmetricKey(symmetricKey)
    const message = {
      method: 'encrypt-content',
      params: [
        {
          content: base64url.encode(symmetricKey),
          theirPublicKey: encryptionKey
        }
      ]
    }
    try {
      await idappRendezvousTunnel.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }, [encryptionKey, idappRendezvousTunnel])

  const encryptSecret = useCallback(() => {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
    const message = TypedArrays.string2Uint8Array(secret)
    const encryptedSecret = nacl.secretbox(message, nonce, symmetricKey)

    return { encryptedSecret, nonce }
  }, [secret, symmetricKey])

  const onReady = useCallback(
    async (rc) => {
      rendezvousConnection.current = rc
      encryptSymmetricKey()
    },
    [encryptSymmetricKey]
  )

  useEffect(() => {
    idappRendezvousTunnel.onMessage = async (message) => {
      idappRendezvousTunnel.closeTunnel()
      console.log('idappRendezvousTunnel[message]=', message)
      if (symmetricKey === undefined) {
        setErrorID('symmetricKey is undefined!')
        return
      }
      console.log('received message: ', message)
      const { method, params } = message
      if (method === 'encrypt_content_response' && params) {
        if (params.length > 0) {
          const { encryptedContent, nonce: boxNonce } = params[0]
          const { encryptedSecret, nonce: secretboxNonce } = encryptSecret()
          await storeJSON({
            encryptedSecret: base64url.encode(encryptedSecret),
            encryptedSymmetricKey: encryptedContent,
            secretboxNonce: base64url.encode(secretboxNonce),
            boxNonce
          })
        }
      } else if (method === 'tunnel-message-decrypt-error') {
        const { errorID } = params[0]
        console.log('errorID=', errorID)
        setErrorID(errorID)
      }
    }
    idappRendezvousTunnel.onError = (error) => {
      console.log('error: ', error)
    }
    return () => {
      idappRendezvousTunnel.onMessage = undefined
      idappRendezvousTunnel.onError = undefined
    }
  }, [symmetricKey, encryptSecret, idappRendezvousTunnel])

  const onMessage = useCallback(
    (message) => {
      if (
        message.method === 'store-json-response' &&
        message.params.length > 0
      ) {
        const { cid } = message.params[0]
        onEncryptedCIDRetrieved && onEncryptedCIDRetrieved(cid)
      }
    },
    [onEncryptedCIDRetrieved]
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

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>
          Encrypting secret. Please keep your IdApp <Blue>open</Blue>.
        </InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { EncryptSecret }
