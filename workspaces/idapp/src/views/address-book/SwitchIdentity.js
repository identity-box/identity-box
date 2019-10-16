import React, { useState, useCallback, useRef } from 'react'
import { useTheme } from 'react-navigation'
import Constants from 'expo-constants'
import { FlatList, View } from 'react-native'
import styled from '@emotion/native'

import { useIdentity } from 'src/identity'
import { ThemeConstants } from 'src/theme'

import { IdentityCell } from './IdentityCell'

import { Header } from './ui'

const Container = styled.View({
  flex: 1
})

const MrFiller = styled.View(({ height, color }) => ({
  width: '100%',
  height,
  backgroundColor: color
}))

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

  const getCellBackgroundColor = useCallback(index => {
    if (index % 2) {
      return theme === 'light' ? 'white' : '#222'
    } else {
      return theme === 'light' ? '#eee' : '#111'
    }
  }, [])

  return (
    <Container style={{
      backgroundColor: theme === 'light' ? 'white' : '#111'
    }}
    >
      <MrFiller height={Constants.statusBarHeight} color={theme === 'light' ? 'white' : 'black'} />
      <View style={{
        marginTop: 20,
        marginBottom: 20,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: ThemeConstants[theme].accentColor,
        backgroundColor: ThemeConstants[theme].accentColor,
        borderRadius: 10,
        padding: 10
      }}
      >
        <Header>Switch Identity</Header>
      </View>
      <View style={{
        flexGrow: 1,
        borderWidth: theme === 'light' ? 2 : 1,
        borderColor: theme === 'light' ? ThemeConstants[theme].accentColor : 'white',
        borderRadius: 10,
        margin: 10,
        paddingTop: 10,
        paddingBottom: 10,
        marginBottom: 20
      }}
      >
        <FlatList
          data={identityNames}
          renderItem={({ item, index }) => (
            <IdentityCell
              onSelect={onSelect}
              textAlign='center'
              backgroundColor={getCellBackgroundColor(index)}
            >
              {item}
            </IdentityCell>
          )}
          keyExtractor={(item, index) => item}
        />
      </View>
      {/* <MrSpacer space={20} /> */}
    </Container>
  )
}

export { SwitchIdentity }
