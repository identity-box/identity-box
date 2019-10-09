import React, { useState, useCallback, useEffect } from 'react'
import { Button, View, StyleSheet } from 'react-native'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'

import { MultiTelepathConfiguration } from 'src/telepath'

import {
  PageContainer,
  Container,
  Description,
  Welcome
} from 'src/views/identity/ui'

const ScanIdBoxTelepath = ({ navigation }) => {
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [scanning, setScanning] = useState(false)

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

  const cancel = useCallback(() => {
    console.log('cancel')
    setScanning(false)
  }, [])

  const getChannelDescription = connectUrl => {
    const match = connectUrl.match(/#I=(?<id>.*)&E=(?<key>.*)&A=(?<appName>.*)&S=(?<servicePointId>.*)/)

    return match && match.groups
  }

  const handleBarCodeScanned = useCallback(async ({ type, data }) => {
    console.log(`Code scanned. Type: ${type}, data: ${data}`)
    setScanning(false)
    const channelDescription = getChannelDescription(data)
    console.log('channelDescription:', channelDescription)
    const telepathConfiguration = MultiTelepathConfiguration.instance('idbox')
    await telepathConfiguration.set(channelDescription)
    navigation.navigate('AppLoading')
  })

  return (
    <PageContainer>
      <Container>
        <Welcome>Identity Box</Welcome>
        <Description style={{
          flexGrow: 1
        }}
        >
          Scan your Identity Box QR-Code to connect...
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
          title={scanning ? 'Cancel' : 'Scan...'}
          color={scanning ? 'black' : '#FF6699'}
          disabled={!cameraEnabled}
          accessibilityLabel='Scan QR-Code'
          onPress={scanning ? cancel : scanQRCode}
        />
      </Container>
    </PageContainer>
  )
}

export { ScanIdBoxTelepath }
