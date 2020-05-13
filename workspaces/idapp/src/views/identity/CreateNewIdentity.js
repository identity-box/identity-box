import React, { useState, useRef, useCallback } from 'react'
import { ActivityIndicator, Button } from 'react-native'
import { StackActions, NavigationActions } from 'react-navigation'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import nacl from 'tweetnacl'
import { TypedArrays } from '@react-frontend-developer/buffers'

import { ThemedButton } from 'src/theme'
import { randomBytes, entropyToMnemonic } from 'src/crypto'
import { useTelepath } from 'src/telepath'
import { useIdentity } from 'src/identity'
import { MrSpacer } from 'src/ui'
import { createIdentity } from './createIdentity'

import {
  PageContainer,
  Container,
  Welcome,
  Description,
  IdentityName,
  Row
} from './ui'

const CreateNewIdentity = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const telepathProvider = useRef(undefined)
  const signingKeyPair = useRef(undefined)
  const encryptionKeyPair = useRef(undefined)
  const [name, setName] = useState('')
  const nameRef = useRef(undefined)
  const [nameAlreadyExists, setNameAlreadyExists] = useState(false)
  const [inProgress, setInProgress] = useState(false)

  useTelepath({
    name: 'idbox',
    onTelepathReady: ({ telepathProvider: tp }) => {
      telepathProvider.current = tp
    },
    onMessage: message => {
      console.log('received message: ', message)
      if (message.method === 'create-identity-response' && message.params && message.params.length === 1) {
        const { identity } = message.params[0]
        persistIdentity(identity)
      } else if (message.method === 'backup-response') {
        navigation.navigate('CurrentIdentity')
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

  const writeBackupToIdBox = async (telepathProvider, encryptedBackup, backupId, identityNames) => {
    const message = {
      jsonrpc: '2.0',
      servicePath: 'identity-box.identity-service',
      from: telepathProvider.clientId,
      method: 'backup',
      params: [{
        encryptedBackup,
        backupId,
        identityNames
      }]
    }
    try {
      await telepathProvider.emit(message, {
        to: telepathProvider.servicePointId
      })
    } catch (e) {
      console.log(e.message)
    }
  }

  const goHomeAndResetNavigation = () => {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'MainAppStack' })]
    })
    navigation.dispatch(resetAction)
  }

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
      const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
      if (backupEnabled) {
        const backupKey = base64url.toBuffer(await SecureStore.getItemAsync('backupKey'))
        const encryptedBackup = await identityManager.current.createEncryptedBackupWithKey(backupKey)
        const backupId = backupIdFromBackupKey(backupKey)
        writeBackupToIdBox(telepathProvider.current, encryptedBackup, backupId, identityManager.current.keyNames)
      }
      goHomeAndResetNavigation()
    } catch (e) {
      console.error(e)
    }
  }

  const backupIdFromBackupKey = backupKey => {
    const mnemonic = entropyToMnemonic(backupKey)
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic, 'utf8')
    return base64url.encode(nacl.hash(mnemonicUint8Array))
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
      telepathChannel: telepathProvider.current.channel,
      keyName,
      publicEncryptionKey,
      publicSigningKey
    })
  }, [name])

  const onNameChanged = useCallback(name => {
    if (identityManager.current.identityNames.includes(name.trim())) {
      setNameAlreadyExists(true)
    } else {
      setNameAlreadyExists(false)
    }
    setName(name)
  })

  const onCancel = useCallback(() => {
    navigation.navigate('AddressBook')
  }, [])

  return (
    <PageContainer style={{
      justifyContent: 'flex-start',
      paddingTop: 30
    }}
    >
      <Container>
        <Welcome>Create new identity</Welcome>
        <Description>
          Give your identity an easy to remember name. This name will not be shared.
        </Description>
        <IdentityName
          placeholder='Identity name...'
          onChangeText={onNameChanged}
          value={name}
        />
        {nameAlreadyExists
          ? <Description style={{ color: 'red', marginBottom: 10 }}>You already have identity with that name...</Description>
          : <MrSpacer space={25} />}
        {inProgress ? <ActivityIndicator /> : (
          <Row style={{ justifyContent: 'space-around' }}>
            <ThemedButton
              onPress={onCreateIdentity}
              title='Create...'
              disabled={name.length === 0 || nameAlreadyExists}
              accessibilityLabel='Create an identity...'
            />
            <Button
              onPress={onCancel}
              title='Cancel'
              accessibilityLabel='Cancel'
            />
          </Row>
        )}
      </Container>
    </PageContainer>
  )
}

export { CreateNewIdentity }
