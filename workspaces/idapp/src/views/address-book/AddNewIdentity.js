import React, { useState, useCallback, useRef } from 'react'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import { Button } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import nacl from 'tweetnacl'
import { TypedArrays } from '@react-frontend-developer/buffers'

import { entropyToMnemonic } from 'src/crypto'

import { useTelepath } from 'src/telepath'
import { useIdentity } from 'src/identity'
import {
  Container,
  SubContainer,
  Description,
  IdentityName,
  Did,
  Row
} from './ui'

const AddNewIdentity = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const telepathProvider = useRef(undefined)
  const [name, setName] = useState('')
  const [placeholderText, setPlaceholderText] = useState('name')

  const did = navigation.getParam('did', '')

  const backupIdFromBackupKey = backupKey => {
    const mnemonic = entropyToMnemonic(backupKey)
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic, 'utf8')
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
        writeBackupToIdBox(telepathProvider.current, encryptedBackup, backupId)
      } else {
        navigation.navigate('CurrentIdentity')
      }
    }
  })

  const addIdentity = useCallback(() => {
    console.log('add identity')
    addPeerIdentity({ name, did })
  }, [name, did])

  const cancel = useCallback(() => {
    console.log('cancel')
    navigation.navigate('CurrentIdentity')
  }, [])

  const writeBackupToIdBox = async (telepathProvider, encryptedBackup, backupId) => {
    const message = {
      jsonrpc: '2.0',
      method: 'backup',
      params: [{
        encryptedBackup,
        backupId
      }, {
        from: telepathProvider.clientId
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

  useTelepath({
    name: 'idbox',
    onTelepathReady: async ({ telepathProvider: tp }) => {
      telepathProvider.current = tp
    },
    onMessage: async message => {
      console.log('received message: ', message)
      if (message.method === 'backup-response') {
        navigation.navigate('CurrentIdentity')
      }
    },
    onError: async error => {
      console.log('error: ', error)
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
          onChangeText={setName}
          value={name}
        />
        <QRCode
          value={did}
          size={150}
        />
        <Did>{did}</Did>
        <Row>
          <Button
            title='Add'
            color='#FF6699'
            disabled={!name}
            accessibilityLabel='add identity'
            onPress={addIdentity}
          />
          <Button
            title='Cancel'
            color='black'
            accessibilityLabel='cancel adding identity'
            onPress={cancel}
          />
        </Row>
      </SubContainer>
    </Container>
  )
}

export { AddNewIdentity }
