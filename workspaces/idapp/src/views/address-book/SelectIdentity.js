import React, { useState, useCallback, useRef, useMemo } from 'react'
import Constants from 'expo-constants'
import { Button } from 'react-native'
import { useTheme } from 'react-navigation'
import styled from '@emotion/native'

import { useIdentity } from 'src/identity'
import { MrSpacer } from 'src/ui'

import { AllIdentities } from './AllIdentities'

const Container = styled.View({
  flex: 1
})

const SubContainer = styled.View({
  flexGrow: 1,
  flexShrink: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  paddingTop: 20
})

const SelectIdentity = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const [identityNames, setIdentityNames] = useState([])
  const [identities, setIdentities] = useState({})
  const [peerIdentities, setPeerIdentities] = useState({})
  const rendezvousTunnel = useRef(undefined)
  const theme = useTheme()

  rendezvousTunnel.current = useMemo(() => navigation.getParam('rendezvousTunnel', undefined), [])

  useIdentity({
    onReady: idManager => {
      identityManager.current = idManager
      setIdentities(idManager.identities)
      setPeerIdentities(idManager.peerIdentities)
      setIdentityNames(idManager.identityNames)
    }
  })

  const sendIdentity = async ({ did }) => {
    const message = {
      method: 'select_identity_response',
      params: [{
        did
      }]
    }
    try {
      await rendezvousTunnel.current.send(message)
    } catch (e) {
      console.log(e.message)
    }
  }

  const onSelectPeerIdentity = useCallback(async item => {
    const identity = { name: item, did: peerIdentities[item] }
    console.log('selected identity:', identity)
    if (rendezvousTunnel.current) {
      await sendIdentity(identity)
      navigation.navigate('CurrentIdentity')
    }
  }, [peerIdentities, rendezvousTunnel.current])

  const onSelectOwnIdentity = useCallback(async item => {
    const id = identities[item]
    const identity = { name: id.name, did: id.did, isOwn: true }
    console.log('selected identity:', identity)
    if (rendezvousTunnel.current) {
      await sendIdentity(identity)
      navigation.navigate('CurrentIdentity')
    }
  }, [identities, rendezvousTunnel.current])

  const onCancel = useCallback(() => {
    console.log('cancel')
    navigation.navigate('CurrentIdentity')
  }, [])

  return (
    <Container>
      <MrSpacer space={Constants.statusBarHeight} />
      <SubContainer>
        <AllIdentities
          identityNames={identityNames}
          peerIdentities={peerIdentities}
          onSelectPeerIdentity={onSelectPeerIdentity}
          onSelectOwnIdentity={onSelectOwnIdentity}
        />
      </SubContainer>
      <MrSpacer space={20} />
      <Button
        title='Cancel'
        color={theme === 'light' ? 'black' : 'white'}
        accessibilityLabel='cancel selecting identity'
        onPress={onCancel}
      />
      <MrSpacer space={20} />
    </Container>
  )
}

export { SelectIdentity }
