import { useCallback } from 'react'
import { router } from 'expo-router'
import { useErrorBoundary } from 'react-error-boundary'
import { ActivityIndicator } from 'react-native'

import { useRendezvous } from '~/rendezvous'
import { IdentityManager } from '~/identity'
import { LogDb } from '~/views/diagnostics/LogDb'

import { PageContainer, Container, Welcome, Description } from './ui'

const AppLoading = () => {
  const { showBoundary } = useErrorBoundary()
  const onRendezvousReady = useCallback(async () => {
    try {
      const identityManager = await IdentityManager.instance()

      if (identityManager.hasIdentities()) {
        console.log('has identities')
        const identity = identityManager.getCurrent()
        if (!identity) {
          LogDb.log(
            'AppLoading#onRendezvousReady: identityManager.getCurrent() returns undefined!'
          )
          throw new Error('FATAL: no valid identity selected!')
        }
        if (!identity.keyName) {
          console.log('Need to upgrade identities...')
          router.replace('/idbox-key-naming')
        } else {
          router.replace('/identity/current-identity')
        }
      } else {
        console.log('does not have any identities yet')
        setTimeout(() => {
          router.replace('/first-identity')
        }, 2000)
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [showBoundary])

  const onRendezvousError = useCallback(
    (err: Error) => {
      console.log('AppLoading:onError:', err.message)
      LogDb.log(`AppLoading:onError: ${err.message}`)
      if (
        err.message ===
        'Cannot connect! Missing rendezvous configuration with name <<idbox>>'
      ) {
        router.replace('/scan-idbox')
      } else {
        showBoundary(err)
      }
    },
    [showBoundary]
  )

  useRendezvous({
    name: 'idbox',
    reset: false,
    onReady: onRendezvousReady,
    onError: onRendezvousError
  })

  return (
    <PageContainer>
      <Container
        style={{
          justifyContent: 'center'
        }}
      >
        <Welcome>Welcome to Identity Box App!</Welcome>
        <ActivityIndicator />
        <Description style={{ marginTop: 10 }}>Initializing...</Description>
      </Container>
    </PageContainer>
  )
}

export { AppLoading }
