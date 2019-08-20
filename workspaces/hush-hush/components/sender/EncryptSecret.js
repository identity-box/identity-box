import React, { useCallback, useState, useEffect } from 'react'
import nacl from 'tweetnacl'
import base64url from 'base64url'
import { TypedArrays } from '@react-frontend-developer/buffers'
import { FadingValueBox } from '../animations'
import { Blue, InfoBox, Centered } from '../ui'

import { useTelepath } from '../telepath'

const EncryptSecret = ({ onEncryptedCIDRetrieved, encryptionKey, secret, idappTelepathChannel }) => {
  const [symmetricKey, setSymmetricKey] = useState(undefined)
  const [telepathProvider, setTelepathProvider] = useState(undefined)
  const storeJSON = async json => {
    const message = {
      jsonrpc: '2.0',
      method: 'store-json',
      params: [{
        json
      }]
    }
    try {
      await telepathProvider.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const encryptSymmetricKey = async () => {
    const symmetricKey = nacl.randomBytes(nacl.secretbox.keyLength)
    setSymmetricKey(symmetricKey)
    const message = {
      jsonrpc: '2.0',
      method: 'encrypt-content',
      params: [{
        content: base64url.encode(symmetricKey),
        theirPublicKey: encryptionKey
      }]
    }
    try {
      await idappTelepathChannel.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const encryptSecret = () => {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
    const message = TypedArrays.string2Uint8Array(secret)
    const encryptedSecret = nacl.secretbox(message, nonce, symmetricKey)

    return { encryptedSecret, nonce }
  }

  const onTelepathRady = useCallback(async ({ telepathProvider }) => {
    setTelepathProvider(telepathProvider)
    encryptSymmetricKey()
  }, [])

  useEffect(() => {
    idappTelepathChannel.subscribe(async message => {
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
    }, error => {
      console.log('error: ', error)
    })
  })

  useTelepath({
    name: 'idbox',
    onTelepathReady: onTelepathRady,
    onMessage: message => {
      if (message.method === 'store-json-response' && message.params.length > 0) {
        onEncryptedCIDRetrieved && onEncryptedCIDRetrieved(message.params[0])
      }
    },
    onError: error => {
      console.log(error)
    }
  })

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>Encrypting secret. Please keep your IdApp <Blue>open</Blue>.</InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { EncryptSecret }
