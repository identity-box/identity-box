import React, { useState, useCallback } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Button, Clipboard, ActivityIndicator } from 'react-native'
import { useTheme } from 'react-navigation'
import nacl from 'tweetnacl'

import { IdentityManager } from 'src/identity'
import { useRendezvous } from 'src/rendezvous'
import { Container, Subcontainer, Description, MnemonicText } from './ui'
import { TypedArrays } from '@react-frontend-developer/buffers'
import base64url from 'base64url'
import { ThemeConstants } from 'src/theme'

const BackupMnemonic = ({ navigation }) => {
  const [mnemonic, setMnemonic] = useState(undefined)
  const [backupReady, setBackupReady] = useState(false)
  const theme = useTheme()

  const onDismiss = useCallback(() => {
    navigation.navigate('Settings')
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
      console.log(e.message)
    }
  }

  const backupIdFromMnemonic = mnemonic => {
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic, 'utf8')
    return base64url.encode(nacl.hash(mnemonicUint8Array))
  }

  useRendezvous({
    name: 'idbox',
    onReady: async rendezvousConnection => {
      const identityManager = await IdentityManager.instance()
      const { encryptedBackup, mnemonic } = await identityManager.createEncryptedBackup()
      const backupId = backupIdFromMnemonic(mnemonic)
      setMnemonic(mnemonic)
      Clipboard.setString(mnemonic)
      console.log('encryptedBackup=', encryptedBackup)
      writeBackupToIdBox(rendezvousConnection, encryptedBackup, backupId, identityManager.keyNames)
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
                  Below is your passphrase mnemonic (it is also already copied to your clipboard).
                  You will need it if you ever need to restore your identities.
                </Description>
                <Description style={{ color: 'red' }}>
                  Keep your passphrase off-line and safe. We will not be
                  able to restore it for you if you loose it.
                </Description>
                <MnemonicText>{mnemonic}</MnemonicText>
                <Button
                  color={ThemeConstants[theme].accentColor}
                  onPress={onDismiss}
                  title='Got it'
                  accessibilityLabel='Got it'
                />
              </>
            )
            : (
              <>
                <Description>
                  Enabling backup...
                </Description>
                <ActivityIndicator />
              </>
            )
        }
      </Subcontainer>
    </Container>
  )
}

export { BackupMnemonic }
