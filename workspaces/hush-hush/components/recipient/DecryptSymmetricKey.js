import React, { useEffect } from 'react'
import nacl from 'tweetnacl'
import base64url from 'base64url'
import { TypedArrays } from '@react-frontend-developer/buffers'

import { FadingValueBox } from '../animations'
import { Blue, Green, InfoBox, Centered } from '../ui'

const DecryptSymmetricKey = ({ next, telepathChannel, encryptedSecret, theirPublicKey }) => {
  const decryptSymmetricKey = async () => {
    const encryptedContentBase64 = encryptedSecret.encryptedSymmetricKey
    const nonceBase64 = encryptedSecret.boxNonce
    const message = {
      jsonrpc: '2.0',
      method: 'decrypt-content',
      params: [{
        encryptedContentBase64,
        nonceBase64,
        theirPublicKeyBase64: theirPublicKey
      }]
    }
    try {
      await telepathChannel.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  useEffect(() => {
    telepathChannel.subscribe(async message => {
      console.log('received message: ', message)
      const { method, params } = message
      if (method === 'decrypt_content_response' && params) {
        if (params.length > 0) {
          const { decryptedContent } = params[0]
          console.log('decryptedContent=', decryptedContent)
          const box = base64url.toBuffer(encryptedSecret.encryptedSecret)
          const key = base64url.toBuffer(decryptedContent)
          const nonce = base64url.toBuffer(encryptedSecret.secretboxNonce)
          const decryptedSecret = TypedArrays.uint8Array2string(nacl.secretbox.open(box, nonce, key))
          console.log('decryptedSecret=', decryptedSecret)
        }
      }
    }, error => {
      console.log('error: ', error)
    })
    decryptSymmetricKey()
  })

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>Decrypting your <Blue>secret</Blue> <Green>now...</Green></InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { DecryptSymmetricKey }
