import { useCallback, useState, useRef, useEffect } from 'react'
import { router } from 'expo-router'
import { ActivityIndicator } from 'react-native'
import { useErrorBoundary } from 'react-error-boundary'

import { CryptoUtils, initiateBackup } from '~/crypto'

import { IdentityManager, useIdentity } from '~/identity'
import { useRendezvous } from '~/rendezvous'

import { ThemedButton } from '~/theme'
import { Container, Subcontainer, Description } from './ui'
import { BoxServices, Migration } from '~/box-services'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'
import { LogDb } from '../diagnostics/LogDb'

const IdBoxKeyNaming = () => {
  const { showBoundary } = useErrorBoundary()
  const identityManager = useRef<IdentityManager>()
  const boxServices = useRef<BoxServices>()
  const migration = useRef<Migration>()
  const [migrationStarted, setMigrationStarted] = useState(false)

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
  }, [])

  useIdentity({
    onReady: onIdentityManagerReady
  })

  const doBackup = useCallback(async () => {
    try {
      if (!boxServices.current) {
        LogDb.log('IdBoxKeyNaming#doBackup: boxServices.current is undefined!')
        throw new Error('FATAL: No Connection to Identity Box device!')
      }
      if (!identityManager.current) {
        LogDb.log(
          'IdBoxKeyNaming#doBackup: identityManager.current is undefined!'
        )
        throw new Error('FATAL: Cannot Access Identities!')
      }
      if (
        !(await initiateBackup(boxServices.current, identityManager.current))
      ) {
        router.replace('/app-loading')
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [showBoundary])

  const onRendezvousReady = useCallback((rc: RendezvousClientConnection) => {
    boxServices.current = BoxServices.withConnection(rc)
  }, [])

  const onRendezvousMessage = useCallback(
    async (message: RendezvousMessage) => {
      try {
        if (!identityManager.current) {
          LogDb.log(
            'IdBoxKeyNaming#onRendezvousMessage: identityManager.current is undefined!'
          )
          throw new Error('FATAL: Cannot Access Identities!')
        }
        if (!migration.current) {
          LogDb.log(
            'IdBoxKeyNaming#onRendezvousMessage: migration.current is undefined!'
          )
          throw new Error('FATAL: No valid migration data exist!')
        }
        console.log(
          'received message: ',
          JSON.stringify(message, undefined, '  ')
        )
        if (message.method === 'migrate-response') {
          await identityManager.current.migrateIdentityNames(
            migration.current.migrationData
          )
          doBackup()
        } else if (message.method === 'backup-response') {
          router.replace('/app-loading')
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          showBoundary(e)
        } else {
          showBoundary(new Error('unknown error!'))
        }
      }
    },
    [showBoundary, doBackup]
  )

  const onRendezvousError = useCallback(
    (error: Error) => {
      console.log('error: ', error)
      LogDb.log(`CreateNewIdentity#onRendezvousError: ${error.message}`)
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

  const createMigration: () => Promise<Migration> = useCallback(async () => {
    const idManager = identityManager.current
    if (!idManager) {
      LogDb.log(
        'IdBoxKeyNaming#createMigration: identityManager.current is undefined!'
      )
      throw new Error('FATAL: Cannot Access Identities!')
    }

    const identityNames = idManager.identityNames

    const migrationData = await Promise.all(
      identityNames.map(async (name) => {
        const keyName = await CryptoUtils.createRandomIdentityKeyName()
        return {
          oldName: name,
          newName: keyName
        }
      })
    )

    return {
      migrationType: 'KEY-NAMING',
      migrationData
    }
  }, [])

  const migrate = useCallback(async () => {
    try {
      if (!boxServices.current) {
        LogDb.log('IdBoxKeyNaming#migrate: boxServices.current is undefined!')
        throw new Error('FATAL: No Connection to Identity Box device!')
      }
      migration.current = await createMigration()
      console.log('migration=', migration.current)
      boxServices.current.migrate(migration.current)
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [createMigration, showBoundary])

  const onStartMigration = useCallback(async () => {
    console.log('starting migration now...')
    setMigrationStarted(true)
  }, [])

  useEffect(() => {
    if (migrationStarted) {
      migrate()
    }
  }, [migrationStarted, migrate])

  return (
    <Container>
      <Subcontainer
        style={{
          justifyContent: 'center'
        }}
      >
        {migrationStarted ? (
          <>
            <Description>Migration in progress. Please wait...</Description>
            <ActivityIndicator />
          </>
        ) : (
          <>
            <Description>
              We need to update your identities to a new, more
              privacy-respecting format before continuing. Please keep the app
              open and connected during the update.
            </Description>
            <ThemedButton
              onPress={onStartMigration}
              title='Start...'
              accessibilityLabel='Start migration now!'
            />
          </>
        )}
      </Subcontainer>
    </Container>
  )
}

export { IdBoxKeyNaming }
