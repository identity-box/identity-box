import React, { useState, useRef, useCallback } from 'react'
import { Button, ActivityIndicator } from 'react-native'
import { useTheme } from 'react-navigation'
import base64url from 'base64url'
import nacl from 'tweetnacl'

import { ThemeConstants, ThemedButton } from 'src/theme'
import { randomBytes } from 'src/crypto'
import { useIdentity } from 'src/identity'
import { useRendezvous } from 'src/rendezvous'

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
  const rendezvousConnection = useRef(undefined)
  const signingKeyPair = useRef(undefined)
  const encryptionKeyPair = useRef(undefined)
  const [name, setName] = useState('')
  const nameRef = useRef(undefined)
  const [inProgress, setInProgress] = useState(false)
  const [backupAvailable, setBackupAvailable] = useState(false)
  const theme = useTheme()

  const checkForBackup = async rendezvousConnection => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'has-backup',
      params: []
    }
    try {
      await rendezvousConnection.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  useRendezvous({
    name: 'idbox',
    onReady: rc => {
      rendezvousConnection.current = rc
      checkForBackup(rc)
    },
    onMessage: message => {
      console.log('received message: ', message)
      if (message.method === 'create-identity-response' && message.params && message.params.length === 1) {
        const { identity } = message.params[0]
        persistIdentity(identity)
      } else if (message.method === 'has-backup-response' && message.params && message.params.length === 1) {
        const { hasBackup } = message.params[0]
        setBackupAvailable(hasBackup || false)
      }
    },
    onError: error => {
      console.log('error: ', error)
    }
  })

  useIdentity({
    onReady: idManager => {
      identityManager.current = idManager
    }
  })

  const persistIdentity = async ({ did, name: keyName }) => {
    try {
      const name = nameRef.current
      const identity = {
        did,
        name,
        keyName,
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

  const createRandomIdentityKeyName = async () => {
    const randomValue = await randomBytes(10)
    const timestamp = Date.now()
    return `${timestamp}${base64url.encode(randomValue)}`
  }

  const onCreateIdentity = useCallback(async () => {
    setInProgress(true)
    await createSigningKeyPair()
    await createEncryptionKeyPair()

    nameRef.current = name.trim()
    const keyName = await createRandomIdentityKeyName()
    const publicEncryptionKey = base64url.encode(encryptionKeyPair.current.publicKey)
    const publicSigningKey = base64url.encode(signingKeyPair.current.publicKey)
    createIdentity({
      rendezvousConnection: rendezvousConnection.current,
      keyName,
      publicEncryptionKey,
      publicSigningKey
    })
  }, [name])

  const onRestoreFromBackup = () => {
    navigation.navigate('RestoreFromBackup')
  }

  return (
    <PageContainer>
      <Container style={{
        justifyContent: 'center'
      }}
      >
        <Welcome>Create your first identity</Welcome>
        <Description>
          Give your identity an easy to remember name. This name will not be shared.
        </Description>
        <IdentityName
          placeholder='Identity name...'
          onChangeText={setName}
          value={name}
        />
        <ThemedButton
          onPress={onCreateIdentity}
          title='Create...'
          disabled={name.length === 0}
          accessibilityLabel='Create an identity...'
        />
        {
          backupAvailable && (
            <>
              <Description style={{
                marginTop: 20,
                marginBottom: 20
              }}
              >- OR -
              </Description>
              <Button
                color={ThemeConstants[theme].accentColor}
                onPress={onRestoreFromBackup}
                title='Restore from backup...'
                accessibilityLabel='Restore identities from backup'
              />
            </>
          )
        }
        {inProgress && <ActivityIndicator />}
      </Container>
    </PageContainer>
  )
}

export { FirstIdentity }
