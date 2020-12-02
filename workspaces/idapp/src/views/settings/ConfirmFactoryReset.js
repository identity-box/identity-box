import React, { useCallback, useState } from 'react'
import { Button, ActivityIndicator } from 'react-native'

import { useIdentity } from 'src/identity'
import { useRendezvous, MultiRendezvousConfiguration } from 'src/rendezvous'

import { Container, Subcontainer, Description, Row } from './ui'

const ConfirmFactoryReset = ({ navigation }) => {
  const [identityManager, setIdentityManager] = useState(undefined)
  const [rendezvousConnection, setRendezvousConnection] = useState(undefined)
  const [resetInProgress, setResetInProgress] = useState(false)

  useIdentity({
    onReady: identityManager => {
      setIdentityManager(identityManager)
    }
  })

  useRendezvous({
    name: 'idbox',
    onReady: rendezvousConnection => {
      setRendezvousConnection(rendezvousConnection)
    },
    onMessage: async message => {
      console.log('received message: ', message)
      if (message.method === 'reset-response') {
        const rendezvousConfigurationProvider = await MultiRendezvousConfiguration.instance('idbox')
        await rendezvousConfigurationProvider.reset()
        navigation.navigate('ScanIdBoxTelepath')
      }
    },
    onError: error => {
      console.log('error: ', error)
    }
  })

  const resetIdBox = async (rendezvousConnection, identityNames) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'reset',
      params: [{
        identityNames
      }]
    }
    try {
      await rendezvousConnection.send(message)
    } catch (e) {
      console.warn(e.message)
    }
  }

  const onPerformReset = useCallback(async () => {
    console.log('will perform factory reset now...')
    setResetInProgress(true)
    const identityNames = identityManager.keyNames
    await identityManager.reset()
    resetIdBox(rendezvousConnection, identityNames)
  }, [identityManager, rendezvousConnection])

  return (
    <Container>
      <Subcontainer style={{
        justifyContent: 'center'
      }}
      >
        {resetInProgress
          ? (
            <>
              <Description>
                Resetting....
              </Description>
              <ActivityIndicator />
            </>
            )
          : (
            <>
              <Description>
                This is a new start... Are you sure?
              </Description>
              <Row>
                <Button
                  color='red'
                  onPress={onPerformReset}
                  title='Yes, reset now!'
                  accessibilityLabel='Yes, reset now!'
                />
                <Button
                  onPress={() => navigation.navigate('Settings')}
                  title='Cancel'
                  accessibilityLabel='Cancel'
                />
              </Row>
            </>
            )}
      </Subcontainer>
    </Container>
  )
}

export { ConfirmFactoryReset }
