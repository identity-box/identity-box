import React, { useState, useRef, useCallback } from 'react'
import base64url from 'base64url'
import nacl from 'tweetnacl'
import { Button, ActivityIndicator } from 'react-native'

import { randomBytes } from 'src/crypto'
import { useTelepath } from 'src/telepath'
import { useIdentity } from 'src/identity'

import { createIdentity } from './createIdentity'

import {
  PageContainer,
  Container,
  Welcome,
  Description,
  IdentityName
} from './ui'

const FirstIdentity = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const telepathProvider = useRef(undefined)
  const signingKeyPair = useRef(undefined)
  const encryptionKeyPair = useRef(undefined)
  const [name, setName] = useState('')
  const [inProgress, setInProgress] = useState(false)

  telepathProvider.current = useTelepath(message => {
    console.log('received message: ', message)
    if (message.method === 'set_identity' && message.params && message.params.length === 1) {
      const { identity } = message.params[0]
      persistIdentity(identity)
    }
  }, error => {
    console.log('error: ', error)
  })

  identityManager.current = useIdentity()

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
      telepathChannel: telepathProvider.current.channel,
      name,
      publicEncryptionKey,
      publicSigningKey
    })
  }, [name])

  return (
    <PageContainer>
      <Container style={{
        justifyContent: 'center'
      }}>
        <Welcome>Create your first identity</Welcome>
        <Description>
          Give your identity an easy to remember name.
        </Description>
        <Description>
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
    </PageContainer>
  )
}

export { FirstIdentity }
