import React, { useState, useRef, useCallback } from 'react'
import base64url from 'base64url'
import nacl from 'tweetnacl'
import { Button } from 'react-native'

import { useTelepath } from './useTelepath'
import { createIdentity } from './createIdentity'

import { randomBytes } from 'src/crypto'

import {
  Container,
  Welcome,
  Description,
  IdentityName
} from './ui'

const Identity = () => {
  const channel = useRef(undefined)
  const signingKeyPair = useRef(undefined)
  const encryptionKeyPair = useRef(undefined)
  const [name, setName] = useState('')

  channel.current = useTelepath(message => {
    console.log('received message: ', message)
  }, error => {
    console.log('error: ', error)
  })

  const createSigningKeyPair = async () => {
    const secret = await randomBytes(nacl.sign.publicKeyLength)
    nacl.setPRNG((x, n) => {
      if (n !== nacl.sign.publicKeyLength) {
        throw new Error('World collapse, escape! Now!')
      }
      for (let i = 0; i < n; i++) {
        x[i] = secret[i]
      }
    })
    signingKeyPair.current = nacl.sign.keyPair()
    nacl.setPRNG((x, n) => { throw new Error('No, no, no, no....') })
  }

  const createEncryptionKeyPair = async () => {
    const secretKey = await randomBytes(nacl.box.secretKeyLength)
    encryptionKeyPair.current = nacl.box.keyPair.fromSecretKey(secretKey)
  }

  const onCreateIdentity = useCallback(async () => {
    await createSigningKeyPair()
    await createEncryptionKeyPair()
    const publicEncryptionKey = base64url.encode(encryptionKeyPair.current.publicKey)
    const publicSigningKey = base64url.encode(signingKeyPair.current.publicKey)
    createIdentity({
      telepathChannel: channel.current,
      name,
      publicEncryptionKey,
      publicSigningKey
    })
  }, [name])

  return (
    <Container>
      <Welcome>Create your first identity</Welcome>
      <Description>
        Give your identity an easy to remember name.
        This name will not be shared.
      </Description>
      <IdentityName
        placeholder='Some easy to remember name here...'
        onChangeText={setName}
        value={name}
      />
      <Button
        onPress={onCreateIdentity}
        title='Create...'
        disabled={name.length === 0}
        accessibilityLabel='Create an identity...'
      />
    </Container>
  )
}

export { Identity }
