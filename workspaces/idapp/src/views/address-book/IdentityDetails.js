import React, { useState, useCallback, useRef } from 'react'
import { Themed } from 'react-navigation'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import styled from '@emotion/native'
import { Button, ActivityIndicator } from 'react-native'
import nacl from 'tweetnacl'
import { TypedArrays } from '@react-frontend-developer/buffers'

import { entropyToMnemonic } from 'src/crypto'

import { useIdentity } from 'src/identity'
import { useRendezvous } from 'src/rendezvous'

import { QRCodeThemed, Description } from './ui'

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

const IdentityName = styled(Themed.Text)({
  fontSize: 32,
  fontWeight: 'bold',
  marginBottom: 20
})

const Separator = styled.View(({ size }) => ({
  width: 1,
  height: size
}))

const Did = styled(Themed.Text)({
  fontSize: 12,
  marginBottom: 50,
  textAlign: 'center',
  flexGrow: 1
})

const IdentityDetails = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const rendezvousConnection = useRef(undefined)
  const name = navigation.getParam('name', '')
  const keyName = navigation.getParam('keyName', '')
  const did = navigation.getParam('did', '')
  const isOwn = navigation.getParam('isOwn', false)
  const [inProgress, setInProgress] = useState(false)
  const [identityManagerReady, setIdentityManagerReady] = useState(false)

  const backupIdFromBackupKey = useCallback(backupKey => {
    const mnemonic = entropyToMnemonic(backupKey)
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic, 'utf8')
    return base64url.encode(nacl.hash(mnemonicUint8Array))
  }, [])

  const doBackup = useCallback(async () => {
    const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
    if (backupEnabled) {
      const backupKey = base64url.toBuffer(await SecureStore.getItemAsync('backupKey'))
      const encryptedBackup = await identityManager.current.createEncryptedBackupWithKey(backupKey)
      const backupId = backupIdFromBackupKey(backupKey)
      writeBackupToIdBox(rendezvousConnection.current, encryptedBackup, backupId, identityManager.current.keyNames)
    } else {
      navigation.navigate('AddressBook')
    }
  }, [])

  const { deletePeerIdentity, deleteOwnIdentity } = useIdentity({
    onReady: idManager => {
      identityManager.current = idManager
      setIdentityManagerReady(true)
    },
    onPeerIdentitiesChanged: () => {
      doBackup()
    },
    onOwnIdentitiesChanged: () => {
      console.log('IdentityDetails: onOwnIdentitiesChanged')
      doBackup()
    }
  })

  const deleteIdentity = useCallback(() => {
    console.log(`deleting ${isOwn ? 'own' : 'peer'} identity with name: ${name}`)
    setInProgress(true)
    if (isOwn) {
      deleteIdentityOnIdBox(rendezvousConnection.current, keyName)
    } else {
      deletePeerIdentity({ name })
    }
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

  const deleteIdentityOnIdBox = async (rendezvousConnection, name) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'delete',
      params: [{
        identityName: name
      }]
    }
    try {
      await rendezvousConnection.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  useRendezvous({
    name: 'idbox',
    onReady: rc => {
      rendezvousConnection.current = rc
    },
    onMessage: message => {
      console.log('received message: ', message)
      if (message.method === 'backup-response') {
        console.log('Will navigate to AddressBook')
        navigation.navigate('AddressBook')
      } else if (message.method === 'delete-response') {
        deleteOwnIdentity({ name })
      }
    },
    onError: async error => {
      console.log('error: ', error)
      await SecureStore.deleteItemAsync('backupEnabled')
      navigation.navigate('AddressBook')
    }
  })

  const renderButtonIfAppropriate = useCallback(() => {
    if (inProgress) {
      return <ActivityIndicator style={{ height: 38 }} />
    } else {
      if (!isOwn || identityManager.current.identityNames.length > 1) {
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
            This is your only identity. You can't delete it.
          </Description>
        )
      }
    }
  }, [inProgress, identityManager.current])

  return (
    <Container>
      <SubContainer>
        <IdentityName>{name}</IdentityName>
        <Did>{did}</Did>
        <QRCodeThemed
          value={did}
          size={150}
        />
        <Separator size={40} />
        {identityManagerReady && renderButtonIfAppropriate()}
      </SubContainer>
    </Container>
  )
}

export { IdentityDetails }
