import { useCallback, useRef, useState } from 'react'
import { router } from 'expo-router'
import { Button, ActivityIndicator } from 'react-native'

import { IdentityManager, useIdentity } from '~/identity'
import { useRendezvous, MultiRendezvousConfiguration } from '~/rendezvous'

import { Container, Subcontainer, Description, Row } from './ui'
import { BoxServices } from '~/box-services'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'
import { LogDb } from '../diagnostics/LogDb'
import { useErrorBoundary } from 'react-error-boundary'

const ConfirmFactoryReset = () => {
  const { showBoundary } = useErrorBoundary()
  const identityManager = useRef<IdentityManager>()
  const boxServices = useRef<BoxServices>()
  const [resetInProgress, setResetInProgress] = useState(false)

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
  }, [])

  useIdentity({
    onReady: onIdentityManagerReady
  })

  const onRendezvousReady = useCallback(
    (rendezvousConnection: RendezvousClientConnection) => {
      boxServices.current = BoxServices.withConnection(rendezvousConnection)
    },
    []
  )

  const onRendezvousMessage = useCallback(
    async (message: RendezvousMessage) => {
      console.log(
        'received message: ',
        JSON.stringify(message, undefined, '  ')
      )
      if (message.method === 'reset-response') {
        const rendezvousConfigurationProvider =
          await MultiRendezvousConfiguration.instance('idbox')
        await rendezvousConfigurationProvider.reset()
        router.replace('/scan-idbox')
      }
    },
    []
  )

  const onRendezvousError = useCallback(
    (error: Error) => {
      console.log('error: ', error)
      LogDb.log(`ConfirmFactoryReset#onRendezvousError: ${error.message}`)
      showBoundary(error)
    },
    [showBoundary]
  )

  useRendezvous({
    name: 'idbox',
    onReady: onRendezvousReady,
    onMessage: onRendezvousMessage,
    onError: onRendezvousError
  })

  const onPerformReset = useCallback(async () => {
    try {
      if (!boxServices.current) {
        LogDb.log(
          'ConfirmFactoryReset#onPerformReset: boxServices.current is undefined!'
        )
        throw new Error('FATAL: No Connection to Identity Box device!')
      }
      if (!identityManager.current) {
        LogDb.log(
          'ConfirmFactoryReset#onPerformReset: identityManager.current is undefined!'
        )
        throw new Error('FATAL: Cannot Access Identities!')
      }
      console.log('will perform factory reset now...')
      setResetInProgress(true)
      const identityNames = identityManager.current.keyNames
      await identityManager.current.reset()
      boxServices.current.resetIdBox(identityNames)
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [showBoundary])

  return (
    <Container>
      <Subcontainer
        style={{
          justifyContent: 'center'
        }}
      >
        {resetInProgress ? (
          <>
            <Description>Resetting....</Description>
            <ActivityIndicator />
          </>
        ) : (
          <>
            <Description>This is a new start... Are you sure?</Description>
            <Row>
              <Button
                color='red'
                onPress={onPerformReset}
                title='Yes, reset now!'
                accessibilityLabel='Yes, reset now!'
              />
              <Button
                onPress={() => router.back()}
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
