import { useState, useCallback, useRef } from 'react'
import { router } from 'expo-router'
import { Button, ActivityIndicator } from 'react-native'
import { TypedArrays } from '@react-frontend-developer/buffers'
import nacl from 'tweetnacl'
import base64url from 'base64url'

import { ThemedButton } from '~/theme'
import { mnemonicToEntropy } from '~/crypto'
import { IdentityManager } from '~/identity'
import { useRendezvous } from '~/rendezvous'
import {
  Container,
  Subcontainer,
  Header,
  Description,
  PassphraseMnemonic,
  PassphraseMnemonicContainer,
  Row
} from './ui'
import { BoxServices } from '~/box-services'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'
import { useErrorBoundary } from 'react-error-boundary'
import { LogDb } from '../diagnostics'

const RestoreFromBackup = () => {
  const { showBoundary } = useErrorBoundary()
  const [inProgress, setInProgress] = useState(false)
  const [passphraseValid, setPassphraseValid] = useState(false)
  const [focused, setFocused] = useState(false)
  const [mnemonic, setMnemonic] = useState<string>()
  const backupKey = useRef<Uint8Array>()
  const boxServices = useRef<BoxServices>()

  const onRendezvousReady = useCallback(
    async (rc: RendezvousClientConnection) => {
      boxServices.current = BoxServices.withConnection(rc)
    },
    []
  )

  const onRendezvousMessage = useCallback(
    async (message: RendezvousMessage) => {
      try {
        if (!backupKey.current) {
          LogDb.log(
            'RestoreFromBackup#onRendezvousMessage: backupKey.current is undefined!'
          )
          throw new Error('FATAL: Invalid backup key!')
        }
        console.log(
          'received message: ',
          JSON.stringify(message, undefined, '  ')
        )
        if (message.method === 'restore-response') {
          const { encryptedBackup } = message.params[0] as {
            encryptedBackup: string
          }
          if (encryptedBackup === 'not found') {
            router.push('/backup-not-found')
          } else {
            const identityManager = await IdentityManager.instance()
            await identityManager.initFromEncryptedBackup(
              encryptedBackup,
              backupKey.current
            )
            router.replace('/identity/current-identity')
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          showBoundary(e)
        } else {
          showBoundary(new Error('unknown error!'))
        }
      }
    },
    [showBoundary]
  )

  const onRendezvousError = useCallback(
    (error: Error) => {
      setInProgress(false)
      console.log('error: ', error)
      LogDb.log(`RestoreFromBackup#onRendezvousError: ${error.message}`)
      showBoundary(error)
    },
    [showBoundary]
  )

  useRendezvous({
    name: 'idbox',
    onReady: onRendezvousReady,
    onMessage: onRendezvousMessage,
    onError: onRendezvousError
  })

  const validateMnemonic = useCallback(() => {
    try {
      if (!mnemonic) return
      const entropy = mnemonicToEntropy(mnemonic)
      console.log('entropy=', entropy)
      const key = TypedArrays.string2Uint8Array(entropy, 'hex')
      backupKey.current = key
      setPassphraseValid(true)
    } catch (e) {
      console.log(e)
      setPassphraseValid(false)
    }
  }, [mnemonic])

  const backupIdFromMnemonic = (mnemonic: string) => {
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic)
    return base64url.encode(Buffer.from(nacl.hash(mnemonicUint8Array)))
  }

  const onChangeText = useCallback((text: string) => {
    setMnemonic(text)
  }, [])

  const onCancel = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/first-identity')
    }
  }, [])

  const onRestore = useCallback(() => {
    if (!mnemonic) return
    try {
      if (!boxServices.current) {
        LogDb.log(
          'RestoreFromBackup#onRestore: boxServices.current is undefined!'
        )
        throw new Error('FATAL: No Connection to Identity Box device!')
      }
      console.log('restoring....')
      setInProgress(true)
      const backupId = backupIdFromMnemonic(mnemonic)
      boxServices.current.restoreIdBox(backupId)
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [mnemonic, showBoundary])

  const onSubmit = useCallback(() => {
    setFocused(false)
    validateMnemonic()
  }, [validateMnemonic])

  return (
    <Container>
      <Subcontainer
        style={{
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
        {!focused && !passphraseValid ? (
          <Description>Invalid Mnemonic</Description>
        ) : null}
        {!inProgress ? (
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
        ) : (
          <ActivityIndicator />
        )}
      </Subcontainer>
    </Container>
  )
}

export { RestoreFromBackup }
