import React from 'react'
import { ActivityIndicator, StatusBar } from 'react-native'

import { useIdBoxTelepath } from 'src/telepath'
import { IdentityManager } from 'src/identity'

import {
  PageContainer,
  Container,
  Welcome,
  Description
} from 'src/views/identity/ui'

const AppLoading = ({ navigation }) => {
  useIdBoxTelepath({
    name: 'idbox',
    reset: false,
    onError: () => {
      navigation.navigate('ScanIdBoxTelepath')
    },
    onTelepathReady: async () => {
      const identityManager = await IdentityManager.instance()
      if (identityManager.hasIdentities()) {
        console.log('has identities')
        setTimeout(() => {
          navigation.navigate('CurrentIdentity')
        }, 2000)
      } else {
        console.log('does not have any identities yet')
        setTimeout(() => {
          navigation.navigate('FirstIdentity')
        }, 2000)
      }
    }
  })

  return (
    <PageContainer>
      <Container style={{
        justifyContent: 'center'
      }}>
        <Welcome>Welcome to Identity Box App!</Welcome>
        <ActivityIndicator />
        <Description style={{ marginTop: 10 }}>Initializing...</Description>
        <StatusBar barStyle='default' />
      </Container>
    </PageContainer>
  )
}

export { AppLoading }
