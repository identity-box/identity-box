import React, { useState, useCallback, useEffect } from 'react'
import { Button, View, StyleSheet } from 'react-native'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'
// import styled from '@emotion/native'

import { useIdentity } from 'src/identity'

import {
  PageContainer,
  Container,
  Description,
  Welcome
} from 'src/views/identity/ui'

const CurrentIdentity = () => {
  const [identity, setIdentity] = useState({ name: '', did: '' })
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [scanning, setScanning] = useState(false)

  useIdentity({
    onReady: identityManager => {
      setIdentity(identityManager.getCurrent())
    }
  })

  const enableCamera = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    setCameraEnabled(status === 'granted')
  }

  useEffect(() => {
    enableCamera()
  }, [])

  const scanQRCode = useCallback(async () => {
    console.log('scan QR code')
    setScanning(true)
  }, [])

  const handleBarCodeScanned = useCallback(({ type, data }) => {
    console.log(`Code scanned. Type: ${type}, data: ${data}`)
    setScanning(false)
  })

  return (
    <PageContainer>
      <Container>
        <Welcome>{identity.name}</Welcome>
        <Description style={{
          flexGrow: 1
        }}>
          {identity.did}
        </Description>
        { scanning && <View style={{
          width: 200,
          height: 200
        }}>
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
