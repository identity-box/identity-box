import React, { useState, useCallback, useEffect } from 'react'
import { Button, View, StyleSheet } from 'react-native'
import { useTheme } from 'react-navigation'
import { BarCodeScanner } from 'expo-barcode-scanner'

import { MultiRendezvousConfiguration } from 'src/rendezvous'
import { DiagnosticsSensor } from 'src/views/diagnostics'

import {
  PageContainer,
  Container,
  Description,
  Welcome
} from './ui'

const ScanIdBoxTelepath = ({ navigation }) => {
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [scanning, setScanning] = useState(false)
  const theme = useTheme()

  const enableCamera = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync()
    setCameraEnabled(status === 'granted')
  }

  useEffect(() => {
    enableCamera()
  }, [])

  const exitDiagnostics = useCallback(() => {
    navigation.navigate('ScanIdBoxTelepath')
  }, [])

  const scanQRCode = useCallback(async () => {
    console.log('scan QR code')
    setScanning(true)
  }, [])

  const cancel = useCallback(() => {
    console.log('cancel')
    setScanning(false)
  }, [])

  const handleBarCodeScanned = useCallback(async ({ type, data: url }) => {
    console.log(`Code scanned. Type: ${type}, url: ${url}`)
    setScanning(false)
    const rendezvousConfiguration = await MultiRendezvousConfiguration.instance('idbox')
    await rendezvousConfiguration.set({ url })
    navigation.navigate('AppLoading')
  })

  return (
    <PageContainer>
      <View style={{
        flexGrow: 1,
        height: 0
      }}
      />
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
          color={scanning ? (theme === 'light' ? 'black' : 'white') : '#FF6699'}
          disabled={!cameraEnabled}
          accessibilityLabel='Scan QR-Code'
          onPress={scanning ? cancel : scanQRCode}
        />
      </Container>
      <DiagnosticsSensor navigation={navigation} onExit={exitDiagnostics} />
    </PageContainer>
  )
}

export { ScanIdBoxTelepath }
