import { useState, useCallback, useEffect, useRef } from 'react'
import { Button, View, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useTheme } from '@emotion/react'
import { BarCodeScanner } from 'expo-barcode-scanner'

import { IdentityManager, useIdentity } from '~/identity'
import { MultiRendezvousConfiguration } from '~/rendezvous'

import { useBrowserConnection } from './useBrowserConnection'

import { PageContainer, Container, Description, Welcome } from './ui'
import { CurrentIdentityChangedFunctionParams } from '~/identity/IdentityManager'

type IdentityForUI = {
  name: string
  did: string
}

const CurrentIdentity = () => {
  const [identity, setIdentity] = useState<IdentityForUI>({ name: '', did: '' })
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [cameraSize, setCameraSize] = useState(200)
  const identityManager = useRef<IdentityManager | undefined>(undefined)
  const [rendezvousUrl, setRendezvousUrl] = useState<string | undefined>(
    undefined
  )
  const [tunnelId, setTunnelId] = useState<string | undefined>(undefined)
  const { colorScheme: theme } = useTheme()

  const enableCamera = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync()
    setCameraEnabled(status === 'granted')
  }

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    const currentIdentity = idManager.getCurrent()
    if (currentIdentity) {
      const { name, did } = currentIdentity
      setIdentity({ name, did })
    }
    identityManager.current = idManager
  }, [])

  const currentIdentityChanged = useCallback(
    ({ currentIdentity }: CurrentIdentityChangedFunctionParams) => {
      const { name, did } = currentIdentity
      setIdentity({ name, did })
    },
    []
  )

  useIdentity({
    name: 'CurrentIdentity',
    onReady: onIdentityManagerReady,
    currentIdentityChanged
  })

  const onConnectionClosed = useCallback(({ status }: { status?: string }) => {
    console.log(`onConnectionClosed: ${status}`)
    setTunnelId(undefined)
    setRendezvousUrl(undefined)
  }, [])

  useBrowserConnection({
    url: rendezvousUrl,
    tunnelId,
    name: 'CurrentIdentity[useBrowserConnection]',
    onConnectionClosed
  })

  useEffect(() => {
    enableCamera()
  }, [])

  const addNewIdentity = useCallback(({ did }: { did: string }) => {
    router.push({ pathname: '/identity/add-new-identity', params: { did } })
  }, [])

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

  const parseUrl = (connectUrl: string) => {
    const match = connectUrl.match(
      /^(?<url>(?<baseUrl>(?:http(?<https>s)?:\/\/)(?<domain>localhost|(?:[\w.-]+(?:\.[\w.-]+)+))+(?::(?<port>\d+)?)?)(?:(?:\/(?<path>[\w\-._~:/?[\]@!$&'()*+,;=.]+))?(?<fragment>#.+)?|\/))$/
    )

    return match && match.groups
  }

  const handleBarCodeScanned = useCallback(
    async ({ type, data }: { type: string; data: string }) => {
      console.log(`Code scanned. Type: ${type}, data: ${data}`)
      setScanning(false)
      if (data.match(/^did:ipid:.{46}$/)) {
        console.log(`Detected DID: ${data}`)
        addNewIdentity({ did: data })
      } else {
        const matchGroups = parseUrl(data)
        if (matchGroups) {
          const { baseUrl, path } = matchGroups
          if (baseUrl && path) {
            console.log('rendezvous baseUrl:', baseUrl)
            console.log('rendezvous tunnelId:', path)
            setRendezvousUrl(baseUrl)
            setTunnelId(path)
          } else if (baseUrl) {
            // assuming idbox url
            console.log(`Scanned IdBox with url: ${baseUrl}`)
            const rendezvousConfiguration =
              await MultiRendezvousConfiguration.instance('idbox')
            await rendezvousConfiguration.set({ url: baseUrl })
            router.replace('/app-loading')
          }
        }
      }
    },
    [addNewIdentity]
  )

  const switchIdentity = useCallback(() => {
    console.log('switching identity')
    router.push('/identity/switch-identity')
  }, [])

  return (
    <PageContainer>
      <Container>
        <View
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            flexGrow: 1
          }}
        >
          <TouchableOpacity
            onPress={switchIdentity}
            activeOpacity={theme === 'light' ? 0.2 : 0.5}
          >
            <Welcome>{identity.name}</Welcome>
            <Description>{identity.did}</Description>
          </TouchableOpacity>
        </View>
        {scanning ? (
          <View
            style={{
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
          </View>
        ) : null}
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

export { CurrentIdentity }
