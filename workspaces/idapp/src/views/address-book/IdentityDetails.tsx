import { useState, useCallback, useRef } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import styled from '@emotion/native'
import { Button, ActivityIndicator, DimensionValue } from 'react-native'
import nacl from 'tweetnacl'
import { TypedArrays } from '@react-frontend-developer/buffers'

import { entropyToMnemonic } from '~/crypto'

import { IdentityManager, useIdentity } from '~/identity'
import { useRendezvous } from '~/rendezvous'

import { QRCodeThemed, Description } from './ui'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'

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
  const identityManager = useRef<IdentityManager | undefined>(undefined)
  const rendezvousConnection = useRef<RendezvousClientConnection | undefined>(
    undefined
  )
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

  const backupIdFromBackupKey = useCallback((backupKey: Buffer) => {
    const mnemonic = entropyToMnemonic(backupKey)
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic)
    return base64url.encode(Buffer.from(nacl.hash(mnemonicUint8Array)))
  }, [])

  const doBackup = useCallback(async () => {
    const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
    const backupKeyBase64 = await SecureStore.getItemAsync('backupKey')
    if (backupEnabled && backupKeyBase64) {
      if (!rendezvousConnection.current) {
        throw new Error(
          'fatal error: rendezvousConnection.current is undefined!'
        )
      }
      if (!identityManager.current) {
        throw new Error('fatal error: identityManager.current is undefined!')
      }

      const backupKey = base64url.toBuffer(backupKeyBase64)
      const encryptedBackup =
        await identityManager.current.createEncryptedBackupWithKey(backupKey)
      const backupId = backupIdFromBackupKey(backupKey)
      writeBackupToIdBox(
        rendezvousConnection.current,
        encryptedBackup,
        backupId,
        identityManager.current?.keyNames
      )
    } else {
      router.back()
      // navigation.navigate('AddressBook')
    }
  }, [backupIdFromBackupKey])

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
    console.log(
      `deleting ${isOwn ? 'own' : 'peer'} identity with name: ${name}`
    )
    if (!rendezvousConnection.current) {
      throw new Error('fatal error: rendezvousConnection.current is undefined!')
    }
    setInProgress(true)
    if (isOwn) {
      deleteIdentityOnIdBox(rendezvousConnection.current, keyName)
    } else {
      deletePeerIdentity({ name })
    }
  }, [name, keyName, isOwn, deletePeerIdentity])

  const writeBackupToIdBox = async (
    rendezvousConnection: RendezvousClientConnection,
    encryptedBackup: string,
    backupId: string,
    identityNames: string[]
  ) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'backup',
      params: [
        {
          encryptedBackup,
          backupId,
          identityNames: JSON.stringify(identityNames)
        }
      ]
    }
    try {
      await rendezvousConnection.send(message)
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(e.message)
      } else {
        console.warn('unknown error!')
      }
    }
  }

  const deleteIdentityOnIdBox = async (
    rendezvousConnection: RendezvousClientConnection,
    name: string
  ) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'delete',
      params: [
        {
          identityName: name
        }
      ]
    }
    try {
      await rendezvousConnection.send(message)
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(e.message)
      } else {
        console.warn('unknown error!')
      }
    }
  }

  const onRendezvousReady = useCallback((rc: RendezvousClientConnection) => {
    rendezvousConnection.current = rc
  }, [])

  const onRendezvousMessage = useCallback(
    (message: RendezvousMessage) => {
      console.log('received message: ', message)
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
