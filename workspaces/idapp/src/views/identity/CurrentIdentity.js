import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Button, View, StyleSheet } from 'react-native'
import nacl from 'tweetnacl'
import base64url from 'base64url'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'

import { randomBytes } from 'src/crypto'
import { useIdentity } from 'src/identity'
import { useTelepath } from 'src/telepath'

import {
  PageContainer,
  Container,
  Description,
  Welcome
} from 'src/views/identity/ui'

const CurrentIdentity = ({ navigation }) => {
  const [identity, setIdentity] = useState({ name: '', did: '' })
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [channelDescription, setChannelDescription] = useState({})
  // const [telepathProvider, setTelepathProvider] = useState(undefined)
  const telepathProvider = useRef(undefined)

  const enableCamera = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    setCameraEnabled(status === 'granted')
  }

  const confirmQRCodeScanned = async telepathProvider => {
    const message = {
      jsonrpc: '2.0',
      method: 'connectionSetupDone',
      params: []
    }
    try {
      await telepathProvider.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const sendEncryptedContent = async encryptedContentRecord => {
    const message = {
      jsonrpc: '2.0',
      method: 'encrypt_content_response',
      params: [encryptedContentRecord]
    }
    try {
      await telepathProvider.current.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const sendDecryptedContent = async decryptedContent => {
    const message = {
      jsonrpc: '2.0',
      method: 'decrypt_content_response',
      params: [{
        decryptedContent
      }]
    }
    try {
      await telepathProvider.current.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const sendCurrentIdentity = async currentDid => {
    const message = {
      jsonrpc: '2.0',
      method: 'get_current_identity_response',
      params: [{ currentDid }]
    }
    try {
      await telepathProvider.current.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  useIdentity({
    onReady: identityManager => {
      setIdentity(identityManager.getCurrent())
    }
  })

  useTelepath({
    name: channelDescription.appName,
    channelDescription,
    onMessage: async message => {
      console.log('received message: ', message)
      if (message.method === 'get_current_identity') {
        sendCurrentIdentity(identity.did)
      } else if (message.method === 'select_identity') {
        navigation.navigate('SelectIdentity', { name: channelDescription.appName })
      } else if (message.method === 'encrypt-content' && message.params.length > 0) {
        const { content, theirPublicKey } = message.params[0]
        const nonce = await randomBytes(nacl.box.nonceLength)
        const mySecretKey = identity.encryptionKey.secretKey
        const messageBuffer = base64url.toBuffer(content)
        const encryptedContent = nacl.box(messageBuffer, nonce, base64url.toBuffer(theirPublicKey), mySecretKey)
        sendEncryptedContent({
          encryptedContent: base64url.encode(encryptedContent),
          nonce: base64url.encode(nonce)
        })
      } else if (message.method === 'decrypt-content' && message.params.length > 0) {
        const { encryptedContentBase64, nonceBase64, theirPublicKeyBase64 } = message.params[0]
        const box = base64url.toBuffer(encryptedContentBase64)
        const nonce = base64url.toBuffer(nonceBase64)
        const theirPublicKey = base64url.toBuffer(theirPublicKeyBase64)
        const mySecretKey = identity.encryptionKey.secretKey
        console.log('box=', box)
        console.log('nonce=', nonce)
        console.log('theirPublicKey=', theirPublicKey)
        console.log('mySecretKey=', mySecretKey)
        const decryptedContent = nacl.box.open(box, nonce, theirPublicKey, mySecretKey)
        console.log('decryptedContent=', decryptedContent)
        sendDecryptedContent(base64url.encode(decryptedContent))
      }
    },
    onError: error => {
      console.log('error: ', error)
    },
    onTelepathReady: ({ telepathProvider: tp }) => {
      console.log('telepath ready')
      confirmQRCodeScanned(tp)
      telepathProvider.current = tp
    }
  }, [channelDescription])

  useEffect(() => {
    enableCamera()
  }, [])

  const addNewIdentity = ({ did }) => {
    // let identity
    // if (section.title === 'Your identities') {
    //   const id = identities[item]
    //   identity = { name: id.name, did: id.did }
    // } else {
    //   identity = { name: item, did: peerIdentities[item] }
    // }
    navigation.navigate('AddNewIdentity', { did })
  }

  const scanQRCode = useCallback(async () => {
    console.log('scan QR code')
    setScanning(true)
  }, [])

  const getChannelDescription = connectUrl => {
    const match = connectUrl.match(/#I=(?<id>.*)&E=(?<key>.*)&A=(?<appName>.*)/)

    return match && match.groups
  }

  const handleBarCodeScanned = useCallback(({ type, data }) => {
    console.log(`Code scanned. Type: ${type}, data: ${data}`)
    setScanning(false)
    if (data.match(/^did:ipid:.{46}$/)) {
      console.log(`Detected DID: ${data}`)
      addNewIdentity({ did: data })
    } else {
      const channelDescription = getChannelDescription(data)
      if (channelDescription) {
        console.log('channelDescription:', channelDescription)
        setChannelDescription(channelDescription)
      }
    }
  })

  return (
    <PageContainer>
      <Container>
        <Welcome>{identity.name}</Welcome>
        <Description style={{ flexGrow: 1 }}>
          {identity.did}
        </Description>
        {scanning &&
          <View style={{
            width: 200,
            height: 200
          }}
          >
            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
          </View>}
        <Button
          title='Scan...'
          color='#FF6699'
          disabled={!cameraEnabled || scanning}
          accessibilityLabel='Scan QR-Code'
          onPress={scanQRCode}
        />
      </Container>
    </PageContainer>
  )
}

CurrentIdentity.navigationOptions = {
  tabBarLabel: 'Identity'
}

export { CurrentIdentity }
