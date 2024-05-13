import { useState, useCallback, useEffect } from 'react'
import { router } from 'expo-router'
import { Button, View, StyleSheet } from 'react-native'
import { useTheme } from '@emotion/react'
import { CameraView, Camera } from 'expo-camera'

import { MultiRendezvousConfiguration } from '~/rendezvous'
import { DiagnosticsSensor } from '~/views/diagnostics'

import { PageContainer, Container, Description, Welcome } from './ui'

const ScanIdBox = () => {
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [scanning, setScanning] = useState(false)
  const { theme } = useTheme()

  const enableCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
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

  const handleBarCodeScanned = useCallback(
    async ({ type, data: url }: { type: string; data: string }) => {
      console.log(`Code scanned. Type: ${type}, url: ${url}`)
      setScanning(false)
      const rendezvousConfiguration =
        await MultiRendezvousConfiguration.instance('idbox')
      await rendezvousConfiguration.set({ url })
      router.replace('/app-loading')
    },
    []
  )

  return (
    <PageContainer>
      <View
        style={{
          flexGrow: 1,
          height: 0
        }}
      />
      <Container>
        <Welcome>Identity Box</Welcome>
        <Description
          style={{
            flexGrow: 1
          }}
        >
          Scan your Identity Box QR-Code to connect...
        </Description>
        {scanning ? (
          <View
            style={{
              width: 200,
              height: 200
            }}
          >
            <CameraView
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr']
              }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        ) : null}
        <Button
          title={scanning ? 'Cancel' : 'Scan...'}
          color={scanning ? (theme.dark ? 'white' : 'black') : '#FF6699'}
          disabled={!cameraEnabled}
          accessibilityLabel='Scan QR-Code'
          onPress={scanning ? cancel : scanQRCode}
        />
      </Container>
      <DiagnosticsSensor />
    </PageContainer>
  )
}

export { ScanIdBox }
