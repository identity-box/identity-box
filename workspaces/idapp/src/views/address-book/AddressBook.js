import React, { useRef, useState, useCallback } from 'react'
import { useTheme } from 'react-navigation'

import styled from '@emotion/native'

import { useIdentity } from 'src/identity'
import { AllIdentities } from './AllIdentities'
// import { ListWithHeader } from 'src/ui'

// import { ListContainer } from './ui'
import { AddIdentityButton } from './AddIdentityButton'

const Container = styled.View({
  flex: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  paddingTop: 20
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
    const identity = { name: id.name, did: id.did, keyName: id.keyName, isOwn: true }
    navigation.navigate('IdentityDetails', identity)
  }, [identities])

  return (
    <Container style={{
      backgroundColor: theme === 'light' ? 'white' : '#111'
    }}
    >
      <AllIdentities
        identityNames={identityNames}
        peerIdentities={peerIdentities}
        onSelectPeerIdentity={onSelectPeerIdentity}
        onSelectOwnIdentity={onSelectOwnIdentity}
      />
    </Container>
  )
}

AddressBook.navigationOptions = ({ navigation }) => ({
  title: 'Identities',
  headerRightContainerStyle: {
    paddingRight: 10
  },
  headerRight: () => <AddIdentityButton navigation={navigation} />
})

export { AddressBook }
