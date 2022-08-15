import { useState, useCallback, useRef } from 'react'
import { Button } from 'react-native'
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

  const onCancel = useCallback(() => {
    console.log('cancel')
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
      <MrSpacer space={20} />
      <Button
        title='Cancel'
        color={theme === 'light' ? 'black' : 'white'}
        accessibilityLabel='cancel switching identity'
        onPress={onCancel}
      />
      <MrSpacer space={20} />
    </Container>
  )
}

export { SwitchIdentity }
