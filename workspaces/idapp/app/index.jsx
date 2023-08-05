import { router } from 'expo-router'

import { useRendezvous } from '../src/rendezvous'
import { IdentityManager } from '../src/identity'
import { LogDb } from '../src/views/diagnostics'

import { AppLoading } from '../src/views/main/AppLoading'

export default function Index() {
  useRendezvous({
    name: 'idbox',
    reset: false,
    onError: async (err) => {
      console.warn('AppLoading:onError:', err.message)
      LogDb.log(`AppLoading:onError: ${err.message}`)
      if (
        err.message ===
        'Cannot connect! Missing rendezvous configuration with name <<idbox>>'
      ) {
        router.replace('/scan-idbox')
      }
    },
    onReady: async () => {
      const identityManager = await IdentityManager.instance()

      if (identityManager.hasIdentities()) {
        console.log('has identities')
        const identity = identityManager.getCurrent()
        if (!identity.keyName) {
          console.log('Need to upgrade identities...')
          router.replace('/idbox-key-naming')
        } else {
          router.replace('/(tabs)/identity')
        }
      } else {
        console.log('does not have any identities yet')
        setTimeout(() => {
          router.replace('/first-identity')
        }, 2000)
      }
    }
  })

  return <AppLoading />
}
