import { useState, useRef, useCallback } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import Constants from 'expo-constants'
import { Button } from 'react-native'
import { useTheme } from '@emotion/react'
import styled from '@emotion/native'

import { IdentityManager, useIdentity } from '~/identity'
import { MrSpacer } from '~/ui'

import { AllIdentities } from '~/views/address-book/AllIdentities'

import { useRendezvousTunnel } from '~/rendezvous'

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
  const identityManager = useRef<IdentityManager | undefined>(undefined)
  const [identityNames, setIdentityNames] = useState<Array<string>>([])
  const [identities, setIdentities] = useState<
    Record<
      string,
      {
        name: string
        did: string
      }
    >
  >({})
  const [peerIdentities, setPeerIdentities] = useState<Record<string, string>>(
    {}
  )
  const { colorScheme: theme } = useTheme()

  const { rendezvousUrl: url, tunnelId } = useLocalSearchParams<{
    rendezvousUrl: string
    tunnelId: string
  }>()

  const rendezvousTunnel = useRendezvousTunnel(
    {
      url,
      tunnelId
    },
    true
  )

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
    setIdentities(idManager.identities)
    setPeerIdentities(idManager.peerIdentities)
    setIdentityNames(idManager.identityNames)
  }, [])

  useIdentity({
    name: 'SelectIdentity',
    onReady: onIdentityManagerReady
  })

  const sendIdentity = async ({ did }: { did: string }) => {
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(e.message)
      } else {
        console.warn('unknown error!')
      }
    }
  }

  const onSelectPeerIdentity = async (item: React.ReactNode) => {
    const identity = { name: item, did: peerIdentities[item as string] }
    console.log('selected identity:', identity)
    await sendIdentity(identity)
    router.back()
  }

  const onSelectOwnIdentity = async (item: React.ReactNode) => {
    const id = identities[item as string]
    const identity = { name: id.name, did: id.did, isOwn: true }
    console.log('selected identity:', identity)
    await sendIdentity(identity)
    router.back()
  }

  const onCancel = () => {
    console.log('cancel')
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

export { SelectIdentity }
