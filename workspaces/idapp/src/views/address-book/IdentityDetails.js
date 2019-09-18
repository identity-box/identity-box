import React, { useCallback, useRef } from 'react'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import styled from '@emotion/native'
import QRCode from 'react-native-qrcode-svg'
import { Button } from 'react-native'

import { useIdentity } from 'src/identity'
import { useTelepath } from 'src/telepath'

const Container = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
})

const SubContainer = styled.View({
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80%',
  height: '80%'
})

const IdentityName = styled.Text({
  fontSize: 32,
  fontWeight: 'bold',
  marginBottom: 20
})

const Separator = styled.View(({ size }) => ({
  width: 1,
  height: size
}))

const Did = styled.Text({
  fontSize: 12,
  marginBottom: 20,
  flexGrow: 1,
  textAlign: 'center'
})

const IdentityDetails = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const telepathProvider = useRef(undefined)
  const name = navigation.getParam('name', '')
  const did = navigation.getParam('did', '')
  const isOwn = navigation.getParam('isOwn', false)

  const { deletePeerIdentity } = useIdentity({
    onReady: idManager => {
      identityManager.current = idManager
    },
    onPeerIdentitiesChanged: async () => {
      const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
      if (backupEnabled) {
        const backupKey = base64url.toBuffer(await SecureStore.getItemAsync('backupKey'))
        const encryptedBackup = await identityManager.current.createEncryptedBackupWithKey(backupKey)
        writeBackupToIdBox(telepathProvider.current, encryptedBackup)
      } else {
        navigation.navigate('AddressBook')
      }
    }
  })

  const deleteIdentity = useCallback(() => {
    console.log(`deleting peer identity with name: ${name}`)
    deletePeerIdentity({ name })
  }, [])

  const writeBackupToIdBox = async (telepathProvider, encryptedBackup) => {
    const message = {
      jsonrpc: '2.0',
      method: 'backup',
      params: [{
        encryptedBackup
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
        navigation.navigate('AddressBook')
      }
    },
    onError: async error => {
      console.log('error: ', error)
      await SecureStore.deleteItemAsync('backupEnabled')
      navigation.navigate('AddressBook')
    }
  })

  return (
    <Container>
      <SubContainer>
        <IdentityName>{name}</IdentityName>
        <Did>{did}</Did>
        <QRCode
          value={did}
          size={150}
        />
        {!isOwn &&
          <>
            <Separator size={50} />
            <Button
              title='Delete this identity'
              color='red'
              accessibilityLabel='delete identity'
              onPress={deleteIdentity}
            />
          </>}
      </SubContainer>
    </Container>
  )
}

export { IdentityDetails }
