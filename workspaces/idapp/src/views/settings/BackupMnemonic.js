import React, { useState, useCallback } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Text, Button, Clipboard } from 'react-native'
import nacl from 'tweetnacl'

import { IdentityManager } from 'src/identity'
import { useTelepath } from 'src/telepath'
import { Container, Subcontainer, Description } from './ui'
import { TypedArrays } from '@react-frontend-developer/buffers'
import base64url from 'base64url'

const BackupMnemonic = ({ navigation }) => {
  const [mnemonic, setMnemonic] = useState(undefined)
  const [backupReady, setBackupReady] = useState(false)

  const onDismiss = useCallback(() => {
    navigation.navigate('Settings')
  }, [])

  const writeBackupToIdBox = async (telepathProvider, encryptedBackup, backupId, identityNames) => {
    const message = {
      jsonrpc: '2.0',
      method: 'backup',
      params: [{
        encryptedBackup,
        backupId,
        identityNames
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

  const backupIdFromMnemonic = mnemonic => {
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic, 'utf8')
    return base64url.encode(nacl.hash(mnemonicUint8Array))
  }

  useTelepath({
    name: 'idbox',
    onTelepathReady: async ({ telepathProvider }) => {
      const identityManager = await IdentityManager.instance()
      const { encryptedBackup, mnemonic } = await identityManager.createEncryptedBackup()
      const backupId = backupIdFromMnemonic(mnemonic)
      setMnemonic(mnemonic)
      Clipboard.setString(mnemonic)
      console.log('encryptedBackup=', encryptedBackup)
      writeBackupToIdBox(telepathProvider, encryptedBackup, backupId, identityManager.identityNames)
    },
    onMessage: async message => {
      console.log('received message: ', message)
      if (message.method === 'backup-response') {
        await SecureStore.setItemAsync('backupEnabled', 'true')
        setBackupReady(true)
      }
    },
    onError: error => {
      console.log('error: ', error)
    }
  })

  return (
    <Container>
      <Subcontainer style={{
        justifyContent: 'center'
      }}
      >
        {
          backupReady
            ? (
              <>
                <Description>
                  Below is your passphrase mnemonic (it also already copied to clipboard).
                  You will need it if you ever need to restore your identities.
                </Description>
                <Description style={{ color: 'red' }}>
                  Keep your passphrase off-line and safe. We will not be
                  able to restore it for you if you loose it.
                </Description>
                <Text style={{ textAlign: 'center', marginBottom: 50 }}>{mnemonic}</Text>
                <Button
                  onPress={onDismiss}
                  title='Got it'
                  accessibilityLabel='Got it'
                />
              </>
            )
            : <Text style={{ textAlign: 'center', marginBottom: 50 }}>Creating first backup...</Text>
        }
      </Subcontainer>
    </Container>
  )
}

export { BackupMnemonic }
