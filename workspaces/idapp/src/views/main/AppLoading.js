import React from 'react'
import { ActivityIndicator } from 'react-native'

import { useRendezvous } from 'src/rendezvous'
import { IdentityManager } from 'src/identity'
import { LogDb } from 'src/views/diagnostics'

import {
  PageContainer,
  Container,
  Welcome,
  Description
} from './ui'

const AppLoading = ({ navigation }) => {
  useRendezvous({
    name: 'idbox',
    reset: false,
    onError: async err => {
      console.warn('AppLoading:onError:', err.message)
      LogDb.log(`AppLoading:onError: ${err.message}`)
      if (err.message === 'Cannot connect! Missing rendezvous configuration with name <<idbox>>') {
        navigation.navigate('ScanIdBoxTelepath')
      }
    },
    onReady: async () => {
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
