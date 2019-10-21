import React from 'react'
import { ActivityIndicator } from 'react-native'

import { useTelepath } from 'src/telepath'
import { IdentityManager } from 'src/identity'

import {
  PageContainer,
  Container,
  Welcome,
  Description
} from './ui'

const AppLoading = ({ navigation }) => {
  useTelepath({
    name: 'idbox',
    reset: false,
    onError: () => {
      navigation.navigate('ScanIdBoxTelepath')
    },
    onTelepathReady: async () => {
      const identityManager = await IdentityManager.instance()

      if (identityManager.hasIdentities()) {
        console.log('has identities')
        const identity = identityManager.getCurrent()
        if (!identity.keyName) {
          console.log('Need to upgrade identities...')
          navigation.navigate('IdBoxKeyNaming')
        } else {
          navigation.navigate('CurrentIdentity')
        }
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
      }}
      >
        <Welcome>Welcome to Identity Box App!</Welcome>
        <ActivityIndicator />
        <Description style={{ marginTop: 10 }}>Initializing...</Description>
      </Container>
    </PageContainer>
  )
}

export { AppLoading }
