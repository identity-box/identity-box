import { useState, useRef } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { Button } from 'react-native'
import { useTheme } from 'react-navigation'
import styled from '@emotion/native'
// import { useRecoilValue } from 'recoil'

import { useIdentity } from '~/identity'
import { MrSpacer } from '~/ui'

// import { rendezvousTunnelRecoilState } from 'src/app-state'

import { AllIdentities } from 'src/views/address-book/AllIdentities'

import { useRendezvousTunnel } from '../../../src/rendezvous'

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

const SelectIdentity = () => {
  const router = useRouter()
  // const { send } = useRecoilValue(rendezvousTunnelRecoilState)
  const identityManager = useRef(undefined)
  const [identityNames, setIdentityNames] = useState([])
  const [identities, setIdentities] = useState({})
  const [peerIdentities, setPeerIdentities] = useState({})
  // const rendezvousTunnel = useRef(undefined)
  const theme = useTheme()

  // rendezvousTunnel.current = useMemo(() => navigation.getParam('rendezvousTunnel', undefined), [])

  const { rendezvousUrl: url, tunnelId } = useLocalSearchParams()
  const rendezvousTunnel = useRendezvousTunnel(
    {
      url,
      tunnelId
    },
    true
  )

  useIdentity({
    onReady: (idManager) => {
      identityManager.current = idManager
      setIdentities(idManager.identities)
      setPeerIdentities(idManager.peerIdentities)
      setIdentityNames(idManager.identityNames)
    }
  })

  const sendIdentity = async ({ did }) => {
    const message = {
      method: 'select_identity_response',
      params: [
        {
          did
        }
      ]
    }
    try {
      if (rendezvousTunnel) {
        await rendezvousTunnel.send(message)
      }
      // await send(message)
      // await rendezvousTunnel.current.send(message)
    } catch (e) {
      console.warn(e.message)
    }
  }

  const onSelectPeerIdentity = async (item) => {
    const identity = { name: item, did: peerIdentities[item] }
    console.log('selected identity:', identity)
    await sendIdentity(identity)
    router.back()
  }

  const onSelectOwnIdentity = async (item) => {
    const id = identities[item]
    const identity = { name: id.name, did: id.did, isOwn: true }
    console.log('selected identity:', identity)
    await sendIdentity(identity)
    router.back()
  }

  const onCancel = () => {
    console.log('cancel')
    router.replace('/')
    router.back()
  }

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

export default SelectIdentity
