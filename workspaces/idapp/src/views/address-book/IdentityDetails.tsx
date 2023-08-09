import { useState, useCallback, useRef } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { useErrorBoundary } from 'react-error-boundary'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import styled from '@emotion/native'
import { Button, ActivityIndicator, DimensionValue } from 'react-native'
import { Buffers } from '@react-frontend-developer/buffers'

import { IdentityManager, useIdentity } from '~/identity'
import { useRendezvous } from '~/rendezvous'

import { QRCodeThemed, Description } from './ui'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'
import { BoxServices } from '~/box-services'
import { LogDb } from '~/views/diagnostics'
import { backupIdFromBackupKey } from '~/crypto/backupIdFromBackupKey'

const Container = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
})

const SubContainer = styled.View({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '90%',
  height: '80%'
})

const IdentityName = styled.Text({
  fontSize: 32,
  fontWeight: 'bold',
  marginBottom: 20
})

const Separator = styled.View(({ size }: { size: DimensionValue }) => ({
  width: 1,
  height: size
}))

const Did = styled.Text({
  fontSize: 12,
  marginBottom: 50,
  textAlign: 'center',
  flexGrow: 1
})

const IdentityDetails = () => {
  const { showBoundary } = useErrorBoundary()
  const identityManager = useRef<IdentityManager>()
  const boxServices = useRef<BoxServices>()
  const {
    name = '',
    keyName = '',
    did = '',
    isOwnString = 'false'
  } = useLocalSearchParams<{
    name: string
    keyName: string
    did: string
    isOwnString: string
  }>()
  const isOwn = isOwnString === 'true'
  const [inProgress, setInProgress] = useState(false)
  const [identityManagerReady, setIdentityManagerReady] = useState(false)

  const doBackup = useCallback(async () => {
    try {
      const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
      const backupKeyBase64 = await SecureStore.getItemAsync('backupKey')
      if (backupEnabled && backupKeyBase64) {
        if (!boxServices.current) {
          LogDb.log(
            'IdentityDetails#doBackup: boxServices.current is undefined!'
          )
          throw new Error('FATAL: No Connection to Identity Box device!')
        }
        if (!identityManager.current) {
          LogDb.log(
            'IdentityDetails#doBackup: identityManager.current is undefined!'
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
          identityManager.current?.keyNames
        )
      } else {
        router.back()
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [showBoundary])

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
    setIdentityManagerReady(true)
  }, [])

  const onPeerIdentitiesChanged = useCallback(() => {
    console.log('IdentityDetails: onPeerIdentitiesChanged')
    doBackup()
  }, [doBackup])

  const onOwnIdentitiesChanged = useCallback(() => {
    console.log('IdentityDetails: onOwnIdentitiesChanged')
    doBackup()
  }, [doBackup])

  const { deletePeerIdentity, deleteOwnIdentity } = useIdentity({
    onReady: onIdentityManagerReady,
    onPeerIdentitiesChanged,
    onOwnIdentitiesChanged
  })

  const deleteIdentity = useCallback(() => {
    try {
      console.log(
        `deleting ${isOwn ? 'own' : 'peer'} identity with name: ${name}`
      )
      if (!boxServices.current) {
        LogDb.log('IdentityDetails#doBackup: boxServices.current is undefined!')
        throw new Error('FATAL: No Connection to Identity Box device!')
      }
      setInProgress(true)
      if (isOwn) {
        boxServices.current.deleteIdentityOnIdBox(keyName)
      } else {
        deletePeerIdentity({ name })
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [name, keyName, isOwn, deletePeerIdentity, showBoundary])

  const onRendezvousReady = useCallback((rc: RendezvousClientConnection) => {
    boxServices.current = BoxServices.withConnection(rc)
  }, [])

  const onRendezvousMessage = useCallback(
    (message: RendezvousMessage) => {
      console.log(
        'received message: ',
        JSON.stringify(message, undefined, '  ')
      )
      if (message.method === 'backup-response') {
        router.back()
      } else if (message.method === 'delete-response') {
        deleteOwnIdentity({ name })
      }
    },
    [name, deleteOwnIdentity]
  )

  const onRendezvousError = useCallback(async (error: Error) => {
    console.log('error: ', error)
    await SecureStore.deleteItemAsync('backupEnabled')
    router.back()
  }, [])

  useRendezvous({
    name: 'idbox',
    onReady: onRendezvousReady,
    onMessage: onRendezvousMessage,
    onError: onRendezvousError
  })

  const renderButtonIfAppropriate = useCallback(() => {
    if (inProgress) {
      return <ActivityIndicator style={{ height: 38 }} />
    } else {
      console.log('renderButtonIfAppropriate:', isOwn)
      if (
        !isOwn ||
        (identityManager.current &&
          identityManager.current.identityNames.length > 1)
      ) {
        return (
          <Button
            title='Delete this identity'
            color='red'
            accessibilityLabel='delete identity'
            onPress={deleteIdentity}
          />
        )
      } else {
        return (
          <Description>
            This is your only identity. You can&apos;t delete it.
          </Description>
        )
      }
    }
  }, [isOwn, inProgress, deleteIdentity])

  return (
    <Container>
      <SubContainer>
        <IdentityName>{name}</IdentityName>
        <Did>{did}</Did>
        <QRCodeThemed value={did} size={150} />
        <Separator size={40} />
        {identityManagerReady && renderButtonIfAppropriate()}
      </SubContainer>
    </Container>
  )
}

export { IdentityDetails }
