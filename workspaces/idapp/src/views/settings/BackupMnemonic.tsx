import { useState, useCallback } from 'react'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { Button, ActivityIndicator } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useTheme } from '@emotion/react'
import nacl from 'tweetnacl'

import { IdentityManager } from '~/identity'
import { useRendezvous } from '~/rendezvous'
import { Container, Subcontainer, Description, MnemonicText } from './ui'
import { TypedArrays } from '@react-frontend-developer/buffers'
import base64url from 'base64url'
import { ThemeConstants } from '~/theme'
import { BoxServices } from '~/box-services'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'
import { useErrorBoundary } from 'react-error-boundary'
import { LogDb } from '../diagnostics'
import { useRecoilState } from 'recoil'
import { applicationConfig } from '~/app-state'

const BackupMnemonic = () => {
  const { showBoundary } = useErrorBoundary()
  const [mnemonic, setMnemonic] = useState<string>()
  const [appConfig, updateAppConfig] = useRecoilState(applicationConfig)
  const { backupEnabled } = appConfig
  const { colorScheme: theme } = useTheme()

  const onDismiss = useCallback(() => {
    router.push('/settings')
  }, [])

  const backupIdFromMnemonic = (mnemonic: string) => {
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic)
    return base64url.encode(Buffer.from(nacl.hash(mnemonicUint8Array)))
  }

  const onRendezvousReady = useCallback(
    async (rendezvousConnection: RendezvousClientConnection) => {
      const identityManager = await IdentityManager.instance()
      const { encryptedBackup, mnemonic } =
        await identityManager.createEncryptedBackup()
      const backupId = backupIdFromMnemonic(mnemonic)
      setMnemonic(mnemonic)
      await Clipboard.setStringAsync(mnemonic)
      console.log('encryptedBackup=', encryptedBackup)
      BoxServices.withConnection(rendezvousConnection).writeBackupToIdBox(
        encryptedBackup,
        backupId,
        identityManager.keyNames
      )
    },
    []
  )

  const onRendezvousMessage = useCallback(
    async (message: RendezvousMessage) => {
      console.log('received message: ', message)
      if (message.method === 'backup-response') {
        await SecureStore.setItemAsync('backupEnabled', 'true')
        updateAppConfig((appConfig) => ({
          ...appConfig,
          backupEnabled: true
        }))
      }
    },
    [updateAppConfig]
  )

  const onRendezvousError = useCallback(
    (error: Error) => {
      console.log('error: ', error)
      LogDb.log(`BackupMnemonic#onRendezvousError: ${error.message}`)
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

  return (
    <Container>
      <Subcontainer
        style={{
          justifyContent: 'center'
        }}
      >
        {backupEnabled ? (
          <>
            <Description>
              Below is your passphrase mnemonic (it is also already copied to
              your clipboard). You will need it if you ever need to restore your
              identities.
            </Description>
            <Description style={{ color: 'red' }}>
              Keep your passphrase off-line and safe. We will not be able to
              restore it for you if you loose it.
            </Description>
            <MnemonicText>{mnemonic}</MnemonicText>
            <Button
              color={ThemeConstants[theme].accentColor}
              onPress={onDismiss}
              title='Got it'
              accessibilityLabel='Got it'
            />
          </>
        ) : (
          <>
            <Description>Enabling backup...</Description>
            <ActivityIndicator />
          </>
        )}
      </Subcontainer>
    </Container>
  )
}

export { BackupMnemonic }
