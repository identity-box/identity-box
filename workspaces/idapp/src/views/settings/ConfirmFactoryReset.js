import React, { useCallback, useState } from 'react'
import { Button } from 'react-native'

import { useIdentity } from 'src/identity'
import { useTelepath, MultiTelepathConfiguration } from 'src/telepath'

import { Container, Subcontainer, Description, Row } from './ui'

const ConfirmFactoryReset = ({ navigation }) => {
  const [identityManager, setIdentityManager] = useState(undefined)
  const [telepathProvider, setTelepathProvider] = useState(undefined)

  useIdentity({
    onReady: identityManager => {
      setIdentityManager(identityManager)
    }
  })

  useTelepath({
    name: 'idbox',
    onTelepathReady: ({ telepathProvider }) => {
      setTelepathProvider(telepathProvider)
    },
    onMessage: async message => {
      console.log('received message: ', message)
      if (message.method === 'reset-response') {
        await MultiTelepathConfiguration.reset('idbox')
        navigation.navigate('ScanIdBoxTelepath')
      }
    },
    onError: error => {
      console.log('error: ', error)
    }
  })

  const resetIdBox = async (telepathProvider, identityNames) => {
    const message = {
      jsonrpc: '2.0',
      method: 'reset',
      params: [{
        identityNames
      }, {
        from: telepathProvider.clientId
      }]
    }
    try {
      await telepathProvider.emit(message, {
        to: telepathProvider.servicePointId
      })
    } catch (e) {
      console.log(e.message)
    }
  }

  const onPerformReset = useCallback(async () => {
    console.log('will perform factory reset now...')
    const identityNames = identityManager.identityNames
    await identityManager.reset()
    resetIdBox(telepathProvider, identityNames)
  }, [identityManager, telepathProvider])

  return (
    <Container>
      <Subcontainer style={{
        justifyContent: 'center'
      }}
      >
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
      </Subcontainer>
    </Container>
  )
}

export { ConfirmFactoryReset }
