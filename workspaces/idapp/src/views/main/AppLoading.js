import React, { useEffect, useRef } from 'react'
import { ActivityIndicator, StatusBar } from 'react-native'

import { IdentityManager } from 'src/views/identity'

import {
  Container,
  Welcome,
  Description
} from 'src/views/identity/ui'

const AppLoading = ({ navigation }) => {
  const identityManager = useRef(undefined)

  const selectScreen = async () => {
    identityManager.current = await IdentityManager.instance()

    if (identityManager.current.hasIdentities()) {
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

  useEffect(() => {
    selectScreen()
  }, [])

  return (
    <Container>
      <Welcome>Welcome to Identity Box App!</Welcome>
      <ActivityIndicator />
      <Description>Initializing...</Description>
      <StatusBar barStyle='default' />
    </Container>
  )
}

export { AppLoading }
