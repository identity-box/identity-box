import React, { useState, useCallback, useRef } from 'react'
import { useTheme } from 'react-navigation'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import { Button, ActivityIndicator } from 'react-native'
import nacl from 'tweetnacl'
import { TypedArrays } from '@react-frontend-developer/buffers'

import { entropyToMnemonic } from 'src/crypto'

import { useRendezvous } from 'src/rendezvous'
import { useIdentity } from 'src/identity'
import { MrSpacer } from 'src/ui'
import { ThemedButton } from 'src/theme'
import {
  Container,
  SubContainer,
  Description,
  IdentityName,
  Did,
  Row,
  QRCodeThemed
} from './ui'

const AddNewIdentity = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const rendezvousConnection = useRef(undefined)
  const [name, setName] = useState('')
  const [nameAlreadyExists, setNameAlreadyExists] = useState(false)
  const [placeholderText, setPlaceholderText] = useState('name')
  const [inProgress, setInProgress] = useState(false)
  const theme = useTheme()

  const did = navigation.getParam('did', '')

  const backupIdFromBackupKey = backupKey => {
    const mnemonic = entropyToMnemonic(backupKey)
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic)
    return base64url.encode(nacl.hash(mnemonicUint8Array))
  }

  const { addPeerIdentity } = useIdentity({
    onReady: idManager => {
      identityManager.current = idManager
    },
    onPeerIdentitiesChanged: async () => {
      const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
      if (backupEnabled) {
        const backupKey = base64url.toBuffer(await SecureStore.getItemAsync('backupKey'))
        const encryptedBackup = await identityManager.current.createEncryptedBackupWithKey(backupKey)
        const backupId = backupIdFromBackupKey(backupKey)
        writeBackupToIdBox(rendezvousConnection.current, encryptedBackup, backupId, identityManager.current.keyNames)
      } else {
        setInProgress(false)
        navigation.navigate('CurrentIdentity')
      }
    }
  })

  const onNameChanged = useCallback(name => {
    if (Object.keys(identityManager.current.peerIdentities).includes(name.trim())) {
      setNameAlreadyExists(true)
    } else {
      setNameAlreadyExists(false)
    }
    setName(name)
  })

  const addIdentity = useCallback(() => {
    console.log('add identity')
    setInProgress(true)
    addPeerIdentity({ name: name.trim(), did })
  }, [name, did])

  const cancel = useCallback(() => {
    console.log('cancel')
    navigation.navigate('CurrentIdentity')
  }, [])

  const writeBackupToIdBox = async (rendezvousConnection, encryptedBackup, backupId, identityNames) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'backup',
      params: [{
        encryptedBackup,
        backupId,
        identityNames
      }]
    }
    try {
      await rendezvousConnection.send(message)
    } catch (e) {
      console.warn(e.message)
    }
  }

  useRendezvous({
    name: 'idbox',
    onReady: rc => {
      rendezvousConnection.current = rc
    },
    onMessage: message => {
      console.log('received message: ', message)
      setInProgress(false)
      if (message.method === 'backup-response') {
        navigation.navigate('CurrentIdentity')
      }
    },
    onError: async error => {
      console.log('error: ', error)
      setInProgress(false)
      await SecureStore.deleteItemAsync('backupEnabled')
      navigation.navigate('CurrentIdentity')
    }
  })

  return (
    <Container>
      <SubContainer>
        <Description>Give your new peer identity a descriptive name</Description>
        <IdentityName
          placeholder={placeholderText}
          onFocus={() => setPlaceholderText('')}
          onBlur={() => setPlaceholderText('name')}
          onChangeText={onNameChanged}
          value={name}
        />
        {nameAlreadyExists
          ? <Description style={{ color: 'red', marginBottom: 10 }}>You already have peer identity with that name...</Description>
          : <MrSpacer space={39.5} />}
        <QRCodeThemed
          value={did}
          size={150}
        />
        <Did>{did}</Did>
        {inProgress
          ? <ActivityIndicator />
          : (
            <Row>
              <ThemedButton
                title='Add'
                disabled={!name || nameAlreadyExists}
                accessibilityLabel='add identity'
                onPress={addIdentity}
              />
              <Button
                color={theme === 'light' ? 'black' : 'white'}
                title='Cancel'
                accessibilityLabel='cancel adding identity'
                onPress={cancel}
              />
            </Row>
            )}
      </SubContainer>
    </Container>
  )
}

export { AddNewIdentity }
