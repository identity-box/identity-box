import React, { useRef, useState, useCallback } from 'react'
import { useTheme } from 'react-navigation'
import { Text, View, FlatList, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import styled from '@emotion/native'

import { useIdentity } from 'src/identity'
import { ThemeConstants } from 'src/theme'

import { IdentityCell, EmptyIdentityCell } from './IdentityCell'

const Container = styled.View({
  flex: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
})

const AddressBook = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const [identityNames, setIdentityNames] = useState([])
  const [identities, setIdentities] = useState({})
  const [peerIdentities, setPeerIdentities] = useState({})
  const theme = useTheme()

  useIdentity({
    onReady: idManager => {
      identityManager.current = idManager
      setIdentities(idManager.identities)
      setPeerIdentities(idManager.peerIdentities)
      setIdentityNames(idManager.identityNames)
    },
    onPeerIdentitiesChanged: ({ peerIdentities }) => {
      setPeerIdentities(peerIdentities)
    },
    onOwnIdentitiesChanged: ({ identities, identityNames }) => {
      setIdentities(identities)
      setIdentityNames(identityNames)
    }
  })

  const onSelectPeerIdentity = useCallback((item) => {
    const identity = { name: item, did: peerIdentities[item] }
    navigation.navigate('IdentityDetails', identity)
  }, [peerIdentities])

  const onSelectOwnIdentity = useCallback(item => {
    const id = identities[item]
    const identity = { name: id.name, did: id.did, isOwn: true }
    navigation.navigate('IdentityDetails', identity)
  }, [identities])

  const getCellBackgroundColor = useCallback((index, theme) => {
    if (index % 2) {
      return theme === 'light' ? 'white' : '#222'
    } else {
      return theme === 'light' ? '#eee' : '#111'
    }
  }, [])

  const renderItem = useCallback(({ item, index }, onSelect) => {
    if (item === 'No identities yet!') {
      return <EmptyIdentityCell>{item}</EmptyIdentityCell>
    } else {
      return (
        <IdentityCell
          onSelect={onSelect}
          textAlign='center'
          backgroundColor={getCellBackgroundColor(index, theme)}
        >
          {item}
        </IdentityCell>
      )
    }
  }, [theme])

  return (
    <Container style={{
      backgroundColor: theme === 'light' ? 'white' : '#111'
    }}
    >
      <View style={{
        width: '100%',
        height: '45%'
      }}
      >
        <View style={{
          marginTop: 10,
          alignSelf: 'center',
          paddingLeft: 5,
          borderLeftColor: ThemeConstants[theme].accentColor,
          borderLeftWidth: 3
        }}
        >
          <Text style={{
            color: theme === 'light' ? 'black' : 'white',
            fontSize: 17,
            fontWeight: 'bold'
          }}
          >
          Your identities
          </Text>
        </View>
        <View style={{
          flexGrow: 1,
          width: '90%',
          borderWidth: theme === 'light' ? 2 : 1,
          borderColor: theme === 'light' ? ThemeConstants[theme].accentColor : '#333',
          borderRadius: 10,
          margin: 10,
          paddingTop: 10,
          paddingBottom: 10,
          marginBottom: 20
        }}
        >
          <FlatList
            style={{
              backgroundColor: theme === 'light' ? 'white' : '#111'
            }}
            data={identityNames.length > 0 ? identityNames : ['No identities yet!']}
            renderItem={args => renderItem(args, onSelectOwnIdentity)}
            keyExtractor={(item, index) => item}
          />

        </View>
      </View>
      <View style={{
        width: '100%',
        height: '45%'
      }}
      >
        <View style={{
          marginTop: 10,
          alignSelf: 'center',
          paddingLeft: 5,
          borderLeftColor: ThemeConstants[theme].accentColor,
          borderLeftWidth: 3
        }}
        >
          <Text style={{
            color: theme === 'light' ? 'black' : 'white',
            fontSize: 17,
            fontWeight: 'bold'
          }}
          >
          Peer identities
          </Text>
        </View>
        <View style={{
          flexGrow: 1,
          width: '90%',
          borderWidth: theme === 'light' ? 2 : 1,
          borderColor: theme === 'light' ? ThemeConstants[theme].accentColor : '#333',
          borderRadius: 10,
          margin: 10,
          paddingTop: 10,
          paddingBottom: 10,
          marginBottom: 20
        }}
        >
          <FlatList
            style={{
              backgroundColor: theme === 'light' ? 'white' : '#111'
            }}
            data={Object.keys(peerIdentities).length > 0 ? Object.keys(peerIdentities) : ['No identities yet!']}
            renderItem={args => renderItem(args, onSelectPeerIdentity)}
            keyExtractor={(item, index) => item}
          />
        </View>
      </View>
    </Container>
  )
}

const AddIdentityControl = ({ navigation }) => (
  <TouchableOpacity
    style={{
      aspectRatio: 1,
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}
    onPress={() => navigation.navigate('CreateNewIdentity')}
  >
    <MaterialCommunityIcons
      name='account-plus-outline'
      size={25}
      color='#FF6699'
    />
  </TouchableOpacity>
)

AddressBook.navigationOptions = ({ navigation }) => ({
  title: 'Identities',
  headerRightContainerStyle: {
    paddingRight: 10
  },
  headerRight: <AddIdentityControl navigation={navigation} />
  // headerRight: (
  //   <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
  //     <MaterialCommunityIcons
  //       name='account-plus-outline'
  //       size={25}
  //       color='#FF6699'
  //     />
  //   </TouchableOpacity>
  // )
  // headerRight: (
  //   <MaterialCommunityIcons
  //     name='account-plus-outline'
  //     size={25}
  //     color='#FF6699'
  //     onPress={() => navigation.navigate('Settings')}
  //   />
  // )
  // headerRight: (
  //   <Button
  //     color='#FF6699'
  //     onPress={() => navigation.navigate('Settings')}
  //     title='Add'
  //   />
  // )
})

export { AddressBook }
