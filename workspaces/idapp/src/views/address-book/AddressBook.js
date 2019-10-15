import React, { useRef, useState, useCallback } from 'react'
import { useTheme } from 'react-navigation'
import { SectionList, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import styled from '@emotion/native'

import { useIdentity } from 'src/identity'

import { IdentityCell, EmptyIdentityCell } from './IdentityCell'

const Container = styled.View({
  flex: 1
})

const Separator = styled.View({
  borderBottomWidth: 1,
  borderBottomColor: '#aaa',
  marginLeft: 10
})

const Header = ({ children, ...rest }) => {
  const theme = useTheme()
  return (
    <HeaderText {...rest} theme={theme}>{children}</HeaderText>
  )
}

const HeaderText = styled.Text(({ theme }) => ({
  color: 'white',
  backgroundColor: theme === 'light' ? 'black' : '#1a1a1a',
  fontSize: 16,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 10
}))

const AddressBook = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const [identityNames, setIdentityNames] = useState([])
  const [identities, setIdentities] = useState({})
  const [peerIdentities, setPeerIdentities] = useState({})

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

  const onSelect = useCallback((item, section) => {
    let identity
    if (section.title === 'Your identities') {
      const id = identities[item]
      identity = { name: id.name, did: id.did, isOwn: true }
    } else {
      identity = { name: item, did: peerIdentities[item] }
    }
    navigation.navigate('IdentityDetails', identity)
  }, [identities, peerIdentities])

  return (
    <Container>
      <SectionList
        sections={[
          { title: 'Your identities', data: identityNames.length > 0 ? identityNames : ['No identities yet!'] },
          { title: 'Peer identities', data: Object.keys(peerIdentities).length > 0 ? Object.keys(peerIdentities) : ['No identities yet!'] }
        ]}
        renderItem={({ item, section }) => {
          if (item === 'No identities yet!') {
            return <EmptyIdentityCell>{item}</EmptyIdentityCell>
          } else {
            return <IdentityCell onSelect={item => onSelect(item, section)}>{item}</IdentityCell>
          }
        }}
        renderSectionHeader={({ section }) => (
          <Header>{section.title}</Header>
        )}
        keyExtractor={(item, index) => index}
        ItemSeparatorComponent={() => (
          <Separator />
        )}
      />
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
