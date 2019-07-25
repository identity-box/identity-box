import React, { useState, useRef, useCallback } from 'react'
import base64url from 'base64url'
import nacl from 'tweetnacl'
import { Button } from 'react-native'
import * as SecureStore from 'expo-secure-store'

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
    if (message.method === 'set_identity' && message.params && message.params.length === 1) {
      const { identity } = message.params[0]
      persistIdentity(identity)
    }
  }, error => {
    console.log('error: ', error)
  })

  const persistIdentity = async ({ did, name }) => {
    console.log('encryptionKeyPair.publicKey:', Buffer.from(encryptionKeyPair.current.publicKey).toString('hex'))
    console.log('encryptionKeyPair.secretKey:', Buffer.from(encryptionKeyPair.current.secretKey).toString('hex'))
    console.log('signingKeyPair.publicKey:', Buffer.from(signingKeyPair.current.publicKey).toString('hex'))
    console.log('signingKeyPair.secretKey:', Buffer.from(signingKeyPair.current.secretKey).toString('hex'))
    const encryptionKey = {
      publicKeyBase64: base64url.encode(encryptionKeyPair.current.publicKey),
      secretKeyBase64: base64url.encode(encryptionKeyPair.current.secretKey)
    }
    const signingKey = {
      publicKeyBase64: base64url.encode(signingKeyPair.current.publicKey),
      secretKeyBase64: base64url.encode(signingKeyPair.current.secretKey)
    }
    const key = base64url.encode(name)
    const value = base64url.encode(JSON.stringify({
      did,
      name,
      encryptionKey,
      signingKey
    }))
    console.log('key:', key)
    console.log('value:', value)
    try {
      await SecureStore.setItemAsync(key, value)
      const v = await SecureStore.getItemAsync(key)
      const identity = JSON.parse(base64url.decode(v))
      const { did, name, encryptionKey, signingKey } = identity
      console.log('did:', did)
      console.log('name:', name)
      console.log('encryptionKey.publicKey:', base64url.toBuffer(encryptionKey.publicKeyBase64).toString('hex'))
      console.log('encryptionKey.secretKey:', base64url.toBuffer(encryptionKey.secretKeyBase64).toString('hex'))
      console.log('signingKey.publicKey:', base64url.toBuffer(signingKey.publicKeyBase64).toString('hex'))
      console.log('signingKey.secretKey:', base64url.toBuffer(signingKey.secretKeyBase64).toString('hex'))
    } catch (e) {
      console.error(e)
    }
  }

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
