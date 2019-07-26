import React, { useState, useRef, useCallback, useEffect } from 'react'
import base64url from 'base64url'
import nacl from 'tweetnacl'
import { Button, ActivityIndicator } from 'react-native'

import { useTelepath } from './useTelepath'
import { createIdentity } from './createIdentity'

import { IdentityManager } from './IdentityManager'
import { randomBytes } from 'src/crypto'

import {
  Container,
  Welcome,
  Description,
  IdentityName
} from './ui'

const FirstIdentity = ({ navigation }) => {
  const channel = useRef(undefined)
  const identityManager = useRef(undefined)
  const signingKeyPair = useRef(undefined)
  const encryptionKeyPair = useRef(undefined)
  const [name, setName] = useState('')
  const [inProgress, setInProgress] = useState(false)

  channel.current = useTelepath(message => {
    console.log('received message: ', message)
    if (message.method === 'set_identity' && message.params && message.params.length === 1) {
      const { identity } = message.params[0]
      persistIdentity(identity)
    }
  }, error => {
    console.log('error: ', error)
  })

  const getIdentityManager = async () => {
    identityManager.current = await IdentityManager.instance()
  }

  useEffect(() => {
    getIdentityManager()
  }, [])

  const persistIdentity = async ({ did, name }) => {
    try {
      const identity = {
        did,
        name,
        encryptionKeyPair: encryptionKeyPair.current,
        signingKeyPair: signingKeyPair.current
      }
      await identityManager.current.addIdentity(identity)
      await identityManager.current.setCurrent(name)
      setInProgress(false)
      navigation.navigate('CurrentIdentity')
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
    setInProgress(true)
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
      { inProgress && <ActivityIndicator /> }
    </Container>
  )
}

export { FirstIdentity }
