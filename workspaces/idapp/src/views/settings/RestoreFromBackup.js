import React, { useState, useCallback, useRef } from 'react'
import { Button, ActivityIndicator } from 'react-native'
import { TypedArrays } from '@react-frontend-developer/buffers'
import nacl from 'tweetnacl'
import base64url from 'base64url'

import { ThemedButton } from 'src/theme'
import { mnemonicToEntropy } from 'src/crypto'
import { IdentityManager } from 'src/identity'
import { useRendezvous } from 'src/rendezvous'
import {
  Container,
  Subcontainer,
  Header,
  Description,
  PassphraseMnemonic,
  PassphraseMnemonicContainer,
  Row
} from './ui'

const RestoreFromBackup = ({ navigation }) => {
  const [inProgress, setInProgress] = useState(false)
  const [passphraseValid, setPassphraseValid] = useState(false)
  const [focused, setFocused] = useState(false)
  const [mnemonic, setMnemonic] = useState(undefined)
  const backupKey = useRef(undefined)
  const rendezvousConnection = useRef(undefined)

  const restoreIdBox = async (rendezvousConnection, backupId) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'restore',
      params: [{
        backupId
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
    onReady: async rc => {
      rendezvousConnection.current = rc
    },
    onMessage: async message => {
      console.log('received message: ', message)
      if (message.method === 'restore-response') {
        const { encryptedBackup } = message.params[0]
        if (encryptedBackup === 'not found') {
          navigation.navigate('BackupNotFound')
        } else {
          const identityManager = await IdentityManager.instance()
          await identityManager.initFromEncryptedBackup(encryptedBackup, backupKey.current)
          navigation.navigate('CurrentIdentity')
        }
      }
    },
    onError: error => {
      console.log('error: ', error)
      setInProgress(false)
    }
  })

  const validateMnemonic = () => {
    try {
      const entropy = mnemonicToEntropy(mnemonic)
      console.log('entropy=', entropy)
      const key = TypedArrays.string2Uint8Array(entropy, 'hex')
      backupKey.current = key
      setPassphraseValid(true)
    } catch (e) {
      console.log(e)
      setPassphraseValid(false)
    }
  }

  const backupIdFromMnemonic = mnemonic => {
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic, 'utf8')
    return base64url.encode(nacl.hash(mnemonicUint8Array))
  }

  const onChangeText = useCallback(text => {
    setMnemonic(text)
  }, [])

  const onCancel = useCallback(() => {
    navigation.navigate('FirstIdentity')
  }, [])

  const onRestore = useCallback(() => {
    console.log('restoring....')
    setInProgress(true)
    const backupId = backupIdFromMnemonic(mnemonic)
    restoreIdBox(rendezvousConnection.current, backupId)
  }, [mnemonic])

  const onSubmit = useCallback(() => {
    setFocused(false)
    validateMnemonic()
  }, [mnemonic])

  return (
    <Container>
      <Subcontainer style={{
        justifyContent: 'flex-start'
      }}
      >
        <Header style={{ fontSize: 14 }}>
          Enter your secret passphrase mnemonic below:
        </Header>
        <PassphraseMnemonicContainer>
          <PassphraseMnemonic
            multiline
            autoFocus
            scrollEnabled
            blurOnSubmit
            enablesReturnKeyAutomatically
            returnKeyType='done'
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            onFocus={() => setFocused(true)}
          />
        </PassphraseMnemonicContainer>
        {!focused && !passphraseValid && <Description>Invalid Mnemonic</Description>}
        {!inProgress
          ? (
            <Row style={{ justifyContent: 'space-around' }}>
              <ThemedButton
                onPress={onRestore}
                disabled={!passphraseValid}
                title='Restore'
                accessibilityLabel='Restore'
              />
              <Button
                onPress={onCancel}
                title='Cancel'
                accessibilityLabel='Cancel'
              />
            </Row>
            )
          : <ActivityIndicator />}
      </Subcontainer>
    </Container>
  )
}

export { RestoreFromBackup }
