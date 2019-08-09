import React, { useRef, useState, useCallback } from 'react'
import { SectionList, Button } from 'react-native'

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

const Header = styled.Text({
  color: 'white',
  backgroundColor: 'black',
  fontSize: 16,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 10
})

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
    }
  })

  const onSelect = useCallback((item, section) => {
    let identity
    if (section.title === 'Your identities') {
      const id = identities[item]
      identity = { name: id.name, did: id.did }
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

AddressBook.navigationOptions = {
  title: 'Identities',
  headerRightContainerStyle: {
    paddingRight: 10
  },
  headerRight: (
    <Button
      color='#FF6699'
      onPress={() => console.log('Add identity!')}
      title='Add'
    />
  )
}

export { AddressBook }
