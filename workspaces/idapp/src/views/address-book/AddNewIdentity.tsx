import { useState, useCallback, useRef } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { useTheme } from '@emotion/react'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import { Button, ActivityIndicator } from 'react-native'
import { Buffers } from '@react-frontend-developer/buffers'

import { useRendezvous } from '~/rendezvous'
import { IdentityManager, useIdentity } from '~/identity'
import { MrSpacer } from '~/ui'
import { ThemedButton } from '~/theme'
import {
  Container,
  SubContainer,
  Description,
  IdentityName,
  Did,
  Row,
  QRCodeThemed
} from './ui'
import { LogDb } from '../diagnostics'
import { useErrorBoundary } from 'react-error-boundary'
import { BoxServices } from '~/box-services'
import { backupIdFromBackupKey } from '~/crypto/backupIdFromBackupKey'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'

const AddNewIdentity = () => {
  const { showBoundary } = useErrorBoundary()
  const identityManager = useRef<IdentityManager>()
  const boxServices = useRef<BoxServices>()
  const [name, setName] = useState('')
  const [nameAlreadyExists, setNameAlreadyExists] = useState(false)
  const [placeholderText, setPlaceholderText] = useState('name')
  const [inProgress, setInProgress] = useState(false)
  const { colorScheme: theme } = useTheme()
  const { did } = useLocalSearchParams<{
    did: string
  }>()

  if (!did) {
    LogDb.log('AddNewIdentity#render: <did> url param is undefined!')
    throw new Error('FATAL: <did> url param is undefined!')
  }

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
  }, [])

  const onPeerIdentitiesChanged = useCallback(async () => {
    try {
      const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
      const backupKeyBase64 = await SecureStore.getItemAsync('backupKey')
      if (backupEnabled && backupKeyBase64) {
        if (!boxServices.current) {
          LogDb.log(
            'AddNewIdentity#onPeerIdentitiesChanged: boxServices.current is undefined!'
          )
          throw new Error('FATAL: No Connection to Identity Box device!')
        }
        if (!identityManager.current) {
          LogDb.log(
            'AddNewIdentity#onPeerIdentitiesChanged: identityManager.current is undefined!'
          )
          throw new Error('FATAL: Cannot Access Identities!')
        }
        const backupKey = Buffers.copyToUint8Array(
          base64url.toBuffer(backupKeyBase64)
        )
        const encryptedBackup =
          await identityManager.current.createEncryptedBackupWithKey(backupKey)
        const backupId = backupIdFromBackupKey(backupKey)
        boxServices.current.writeBackupToIdBox(
          encryptedBackup,
          backupId,
          identityManager.current.keyNames
        )
      } else {
        setInProgress(false)
        if (router.canGoBack()) {
          router.back()
        } else {
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
  }, [showBoundary])

  const { addPeerIdentity } = useIdentity({
    onReady: onIdentityManagerReady,
    onPeerIdentitiesChanged
  })

  const onNameChanged = useCallback(
    (name: string) => {
      try {
        if (!identityManager.current) {
          LogDb.log(
            'AddNewIdentity#onNameChanged: identityManager.current is undefined!'
          )
          throw new Error('FATAL: Cannot Access Identities!')
        }
        if (
          Object.keys(identityManager.current.peerIdentities).includes(
            name.trim()
          )
        ) {
          setNameAlreadyExists(true)
        } else {
          setNameAlreadyExists(false)
        }
        setName(name)
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

  const addIdentity = useCallback(() => {
    console.log('add identity')
    setInProgress(true)
    addPeerIdentity({ name: name.trim(), did })
  }, [name, did, addPeerIdentity])

  const cancel = useCallback(() => {
    console.log('cancel')
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/identity/current-identity')
    }
  }, [])

  const onRendezvousReady = useCallback((rc: RendezvousClientConnection) => {
    boxServices.current = BoxServices.withConnection(rc)
  }, [])

  const onRendezvousMessage = useCallback((message: RendezvousMessage) => {
    console.log('received message: ', message)
    setInProgress(false)
    if (message.method === 'backup-response') {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/identity/current-identity')
      }
    }
  }, [])

  const onRendezvousError = useCallback(async (error: Error) => {
    console.log('error: ', error)
    setInProgress(false)
    await SecureStore.deleteItemAsync('backupEnabled')
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/identity/current-identity')
    }
  }, [])

  useRendezvous({
    name: 'idbox',
    onReady: onRendezvousReady,
    onMessage: onRendezvousMessage,
    onError: onRendezvousError
  })

  return (
    <Container>
      <SubContainer>
        <Description>
          Give your new peer identity a descriptive name
        </Description>
        <IdentityName
          placeholder={placeholderText}
          onFocus={() => setPlaceholderText('')}
          onBlur={() => setPlaceholderText('name')}
          onChangeText={onNameChanged}
          value={name}
        />
        {nameAlreadyExists ? (
          <Description style={{ color: 'red', marginBottom: 10 }}>
            You already have peer identity with that name...
          </Description>
        ) : (
          <MrSpacer space={39.5} />
        )}
        <QRCodeThemed value={did} size={150} />
        <Did>{did}</Did>
        {inProgress ? (
          <ActivityIndicator />
        ) : (
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
