import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Button, View, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from 'react-navigation'
import nacl from 'tweetnacl'
import base64url from 'base64url'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'

import { randomBytes } from 'src/crypto'
import { useIdentity } from 'src/identity'
import { useRendezvousTunnel } from 'src/rendezvous'

import {
  PageContainer,
  Container,
  Description,
  Welcome
} from './ui'

const CurrentIdentity = ({ navigation }) => {
  const [identity, setIdentity] = useState({ name: '', did: '' })
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [cameraSize, setCameraSize] = useState(200)
  const identityManager = useRef(undefined)
  const [rendezvousUrl, setRendezvousUrl] = useState(undefined)
  const [tunnelId, setTunnelId] = useState(undefined)
  const rendezvousTunnel = useRef(undefined)
  const theme = useTheme()

  const enableCamera = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    setCameraEnabled(status === 'granted')
  }

  const sendEncryptedContent = async encryptedContentRecord => {
    const message = {
      method: 'encrypt_content_response',
      params: [encryptedContentRecord]
    }
    try {
      await rendezvousTunnel.current.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const sendDecryptedContent = async decryptedContent => {
    const message = {
      method: 'decrypt_content_response',
      params: [{
        decryptedContent
      }]
    }
    try {
      await rendezvousTunnel.current.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const sendErrorMessage = async errorID => {
    const message = {
      method: 'decrypt_content_error',
      params: [{
        errorID
      }]
    }
    try {
      await rendezvousTunnel.current.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const sendCurrentIdentity = async currentDid => {
    const message = {
      method: 'get_current_identity_response',
      params: [{ currentDid }]
    }
    try {
      await rendezvousTunnel.current.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  useIdentity({
    onReady: idManager => {
      setIdentity(idManager.getCurrent())
      identityManager.current = idManager
    },
    currentIdentityChanged: ({ currentIdentity }) => {
      setIdentity(currentIdentity)
    }
  })

  useRendezvousTunnel({
    url: rendezvousUrl,
    tunnelId,
    onReady: rt => {
      rendezvousTunnel.current = rt
    },
    onMessage: async message => {
      console.log('received message: ', message)
      if (message.method === 'get_current_identity') {
        sendCurrentIdentity(identity.did)
      } else if (message.method === 'select_identity') {
        navigation.navigate('SelectIdentity', {
          rendezvousTunnel: rendezvousTunnel.current
        })
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
        const { encryptedContentBase64, nonceBase64, theirPublicKeyBase64, didRecipient } = message.params[0]
        const box = base64url.toBuffer(encryptedContentBase64)
        const nonce = base64url.toBuffer(nonceBase64)
        const theirPublicKey = base64url.toBuffer(theirPublicKeyBase64)
        const myIdentity = identityManager.current.fromDID(didRecipient)
        if (myIdentity) {
          const mySecretKey = myIdentity.encryptionKey.secretKey
          console.log('box=', box)
          console.log('nonce=', nonce)
          console.log('theirPublicKey=', theirPublicKey)
          console.log('mySecretKey=', mySecretKey)
          const decryptedContent = nacl.box.open(box, nonce, theirPublicKey, mySecretKey)
          console.log('decryptedContent=', decryptedContent)
          sendDecryptedContent(base64url.encode(decryptedContent))
        } else {
          sendErrorMessage('NO-MATCHING-IDENTITY-FOUND')
        }
      }
    },
    onError: error => {
      console.log('error: ', error)
    }
  }, [tunnelId, rendezvousUrl])

  useEffect(() => {
    enableCamera()
  }, [])

  const addNewIdentity = ({ did }) => {
    navigation.navigate('AddNewIdentity', { did })
  }

  const scanQRCode = useCallback(() => {
    console.log('scan QR code')
    setTimeout(() => {
      setCameraSize(cameraSize === 200 ? 199 : 200)
    }, 0)
    setScanning(true)
  }, [cameraSize])

  const cancel = useCallback(() => {
    console.log('cancel')
    setScanning(false)
  }, [])

  const parseUrl = connectUrl => {
    const match = connectUrl.match(/^(?<url>(?<baseUrl>(?:http(?<https>s)?:\/\/)(?<domain>localhost|(?:[\w.-]+(?:\.[\w.-]+)+))+(?::(?<port>\d+)?)?)(?:(?:\/(?<path>[\w\-._~:/?[\]@!$&'()*+,;=.]+))?(?<fragment>#.+)?|\/))$/)

    if (match && match.groups) {
      const { baseUrl, path } = match.groups
      console.log(match.groups)
      if (baseUrl && path) {
        return { baseUrl, tunnelId: path }
      }
    }
    return {}
  }

  const handleBarCodeScanned = useCallback(({ type, data }) => {
    console.log(`Code scanned. Type: ${type}, data: ${data}`)
    setScanning(false)
    if (data.match(/^did:ipid:.{46}$/)) {
      console.log(`Detected DID: ${data}`)
      addNewIdentity({ did: data })
    } else {
      const { baseUrl, tunnelId } = parseUrl(data)
      if (baseUrl && tunnelId) {
        console.log('rendezvous baseUrl:', baseUrl)
        console.log('rendezvous tunnelId:', tunnelId)
        setRendezvousUrl(baseUrl)
        setTunnelId(tunnelId)
      }
    }
  }, [])

  const switchIdentity = useCallback(() => {
    console.log('switching identity')
    navigation.navigate('SwitchIdentity')
  }, [])

  return (
    <PageContainer>
      <Container>
        <View style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexGrow: 1
        }}
        >
          <TouchableOpacity onPress={switchIdentity} activeOpacity={theme === 'light' ? 0.2 : 0.5}>
            <Welcome>{identity.name}</Welcome>
            <Description>
              {identity.did}
            </Description>
          </TouchableOpacity>
        </View>
        {scanning &&
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: cameraSize,
            height: cameraSize
          }}
          >
            <BarCodeScanner
              onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
              style={StyleSheet.absoluteFillObject}
            />
          </View>}
      </Container>
      <Button
        title={scanning ? 'Cancel' : 'Scan...'}
        color={scanning ? (theme === 'light' ? 'black' : 'white') : '#FF6699'}
        disabled={!cameraEnabled}
        accessibilityLabel='Scan QR-Code'
        onPress={scanning ? cancel : scanQRCode}
      />
    </PageContainer>
  )
}

CurrentIdentity.navigationOptions = {
  tabBarLabel: 'Identity'
}

export { CurrentIdentity }
