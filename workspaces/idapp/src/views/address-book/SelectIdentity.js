import React, { useState, useCallback, useRef, useMemo } from 'react'
import { SectionList, Button } from 'react-native'
import styled from '@emotion/native'

import { useIdentity } from 'src/identity'
import { useTelepath } from 'src/telepath'

import { HighlightedIdentityCell, EmptyIdentityCell } from './IdentityCell'

const Container = styled.View({
  flex: 1
})

const Separator = styled.View({
  borderBottomWidth: 1,
  borderBottomColor: '#aaa',
  marginLeft: 10
})

const MrSpacer = styled.View(({ space }) => ({
  width: 1,
  height: space
}))

const MrFiller = styled.View(({ height, color }) => ({
  width: '100%',
  height,
  backgroundColor: color
}))

const Header = styled.Text({
  color: 'white',
  backgroundColor: 'black',
  fontSize: 16,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 10
})

const SelectIdentity = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const [identityNames, setIdentityNames] = useState([])
  const [identities, setIdentities] = useState({})
  const [peerIdentities, setPeerIdentities] = useState({})
  const [telepathProvider, setTelepathProvider] = useState(undefined)

  const telepathChannelName = useMemo(() => navigation.getParam('name', undefined), [])

  useIdentity({
    onReady: idManager => {
      identityManager.current = idManager
      setIdentities(idManager.identities)
      setPeerIdentities(idManager.peerIdentities)
      setIdentityNames(idManager.identityNames)
    }
  })

  useTelepath({
    name: telepathChannelName,
    onError: error => {
      console.log('error: ', error)
    },
    onTelepathReady: ({ telepathProvider }) => {
      setTelepathProvider(telepathProvider)
    }
  }, [])

  const sendIdentity = async ({ did }) => {
    const message = {
      jsonrpc: '2.0',
      method: 'set_did',
      params: [{
        did
      }]
    }
    try {
      await telepathProvider.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const onSelect = useCallback(async (item, section) => {
    let identity
    if (section.title === 'Your identities') {
      const id = identities[item]
      identity = { name: id.name, did: id.did }
    } else {
      identity = { name: item, did: peerIdentities[item] }
    }
    console.log('selected identity:', identity)
    if (telepathProvider) {
      await sendIdentity(identity)
      navigation.navigate('CurrentIdentity')
    }
  }, [identities, peerIdentities, telepathProvider])

  const onCancel = useCallback(() => {
    console.log('cancel')
    navigation.navigate('CurrentIdentity')
  }, [])

  return (
    <Container>
      <MrFiller height={32} color='black' />
      <SectionList
        sections={[
          { title: 'Your identities', data: identityNames.length > 0 ? identityNames : ['No identities yet!'] },
          { title: 'Peer identities', data: Object.keys(peerIdentities).length > 0 ? Object.keys(peerIdentities) : ['No identities yet!'] }
        ]}
        renderItem={({ item, section }) => {
          if (item === 'No identities yet!') {
            return <EmptyIdentityCell>{item}</EmptyIdentityCell>
          } else {
            return <HighlightedIdentityCell onSelect={item => onSelect(item, section)}>{item}</HighlightedIdentityCell>
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
      <MrSpacer space={20} />
      <Button
        title='Cancel'
        color='black'
        accessibilityLabel='cancel selecting identity'
        onPress={onCancel}
      />
      <MrSpacer space={20} />
    </Container>
  )
}

export { SelectIdentity }
