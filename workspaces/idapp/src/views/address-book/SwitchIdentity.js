import React, { useState, useCallback, useRef } from 'react'
import { useTheme } from 'react-navigation'
import Constants from 'expo-constants'
import styled from '@emotion/native'

import { useIdentity } from 'src/identity'
import { ListWithHeader, MrSpacer } from 'src/ui'

const Container = styled.View({
  flex: 1
})

const SwitchIdentity = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const [identityNames, setIdentityNames] = useState([])
  const theme = useTheme()

  useIdentity({
    onReady: idManager => {
      identityManager.current = idManager
      setIdentityNames(idManager.identityNames)
    }
  })

  const onSelect = useCallback(async (identityName) => {
    identityManager.current.setCurrent(identityName)
    navigation.navigate('CurrentIdentity')
  }, [])

  return (
    <Container style={{
      backgroundColor: theme === 'light' ? 'white' : '#111'
    }}
    >
      <MrSpacer space={20 + Constants.statusBarHeight} />
      <ListWithHeader
        data={identityNames}
        headerText='Switch Identity'
        onSelect={onSelect}
        width='90%'
      />
    </Container>
  )
}

export { SwitchIdentity }
