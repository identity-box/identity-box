import { useCallback, useState, useEffect, useRef } from 'react'
import nacl from 'tweetnacl'
import base64url from 'base64url'
import { TypedArrays } from '@react-frontend-developer/buffers'
import { FadingValueBox } from '../animations'
import { Blue, InfoBox, Centered } from '../ui'

import { useRendezvous } from '../rendezvous'

const EncryptSecret = ({
  onEncryptedCIDRetrieved,
  encryptionKey,
  secret,
  idappRendezvousTunnel,
  baseUrl
}) => {
  const [symmetricKey, setSymmetricKey] = useState(undefined)
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
      console.log('idappRendezvousTunnel[message]=', message)
      if (symmetricKey === undefined) return
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
