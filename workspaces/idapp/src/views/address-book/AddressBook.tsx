import { useRef, useState, useCallback } from 'react'
import { useTheme } from '@emotion/react'

import styled from '@emotion/native'

import { IdentityManager, useIdentity } from '~/identity'
import { AllIdentities } from './AllIdentities'

import {
  OnOwnIdentitiesChangedFunctionParams,
  OnPeerIdentitiesChangedFunctionParams
} from '~/identity/IdentityManager'
import { router } from 'expo-router'

const Container = styled.View({
  flex: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  paddingTop: 20
})

const AddressBook = () => {
  const identityManager = useRef<IdentityManager | undefined>(undefined)
  const [identityNames, setIdentityNames] = useState<Array<string>>([])
  const [identities, setIdentities] = useState<
    Record<
      string,
      {
        name: string
        did: string
        keyName: string
      }
    >
  >({})
  const [peerIdentities, setPeerIdentities] = useState<Record<string, string>>(
    {}
  )
  const { colorScheme: theme } = useTheme()

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
    setIdentities(idManager.identities)
    setPeerIdentities(idManager.peerIdentities)
    setIdentityNames(idManager.identityNames)
  }, [])

  const onPeerIdentitiesChanged = useCallback(
    (params: OnPeerIdentitiesChangedFunctionParams) => {
      setPeerIdentities(params.peerIdentities)
    },
    []
  )

  const onOwnIdentitiesChanged = useCallback(
    (params: OnOwnIdentitiesChangedFunctionParams) => {
      setIdentities(params.identities)
      setIdentityNames(params.identityNames)
    },
    []
  )

  useIdentity({
    onReady: onIdentityManagerReady,
    onPeerIdentitiesChanged,
    onOwnIdentitiesChanged
  })

  const onSelectPeerIdentity = useCallback(
    (item: React.ReactNode) => {
      const identity = { name: item, did: peerIdentities[item as string] }
      console.log("navigation.navigate('IdentityDetails', identity):", identity)
    },
    [peerIdentities]
  )

  const onSelectOwnIdentity = useCallback(
    (item: React.ReactNode) => {
      console.log('selected:', item)
      const id = identities[item as string]
      const identity = {
        name: id.name,
        did: id.did,
        keyName: id.keyName,
        isOwnString: 'true'
      }
      router.push({
        pathname: '/address-book/identity-details',
        params: {
          ...identity
        }
      })
    },
    [identities]
  )

  return (
    <Container
      style={{
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

export { AddressBook }
