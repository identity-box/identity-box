import React, { useCallback, useState, useRef, useEffect } from 'react'
import { ActivityIndicator } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import nacl from 'tweetnacl'
import { TypedArrays } from '@react-frontend-developer/buffers'

import { randomBytes, entropyToMnemonic } from 'src/crypto'

import { useIdentity } from 'src/identity'
import { useTelepath } from 'src/telepath'

import { ThemedButton } from 'src/theme'
import { Container, Subcontainer, Description } from './ui'

const createRandomIdentityKeyName = async () => {
  const randomValue = await randomBytes(10)
  const timestamp = Date.now()
  return `${timestamp}${base64url.encode(randomValue)}`
}

const IdBoxKeyNaming = ({ navigation }) => {
  const identityManager = useRef(undefined)
  const telepathProvider = useRef(undefined)
  const migration = useRef(undefined)
  const [migrationStarted, setMigrationStarted] = useState(false)

  useIdentity({
    onReady: idManager => {
      identityManager.current = idManager
    }
  })

  useTelepath({
    name: 'idbox',
    onTelepathReady: ({ telepathProvider: tp }) => {
      telepathProvider.current = tp
    },
    onMessage: async message => {
      console.log('received message: ', message)
      if (message.method === 'migrate-response') {
        await identityManager.current.migrateIdentityNames(migration.current.migrationData)
        doBackup()
      } else if (message.method === 'backup-response') {
        navigation.navigate('AppLoading')
      }
    },
    onError: error => {
      console.log('error: ', error)
    }
  })

  const migrate = useCallback(async () => {
    migration.current = await createMigration()
    console.log('migration=', migration.current)
    console.log('clientId=', telepathProvider.current.clientId)
    const message = {
      jsonrpc: '2.0',
      method: 'migrate',
      params: [{
        migration: migration.current
      }, {
        from: telepathProvider.current.clientId
      }]
    }
    try {
      await telepathProvider.current.emit(message, {
        to: telepathProvider.current.servicePointId
      })
    } catch (e) {
      console.log(e.message)
    }
  }, [])

  const writeBackupToIdBox = useCallback(async (telepathProvider, encryptedBackup, backupId, identityNames) => {
    const message = {
      jsonrpc: '2.0',
      method: 'backup',
      params: [{
        encryptedBackup,
        backupId,
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
  }, [])

  const backupIdFromBackupKey = useCallback(backupKey => {
    const mnemonic = entropyToMnemonic(backupKey)
    const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic, 'utf8')
    return base64url.encode(nacl.hash(mnemonicUint8Array))
  }, [])

  const doBackup = useCallback(async () => {
    const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
    if (backupEnabled) {
      const backupKey = base64url.toBuffer(await SecureStore.getItemAsync('backupKey'))
      const encryptedBackup = await identityManager.current.createEncryptedBackupWithKey(backupKey)
      const backupId = backupIdFromBackupKey(backupKey)
      writeBackupToIdBox(telepathProvider.current, encryptedBackup, backupId, identityManager.current.keyNames)
    } else {
      navigation.navigate('AppLoading')
    }
  }, [])

  const createMigration = useCallback(async () => {
    const idManager = identityManager.current
    const identityNames = idManager.identityNames

    const migrationData = await Promise.all(identityNames.map(async name => {
      const keyName = await createRandomIdentityKeyName()
      return {
        oldName: name,
        newName: keyName
      }
    }))

    return {
      migrationType: 'KEY-NAMING',
      migrationData
    }
  }, [identityManager.current])

  const onStartMigration = useCallback(async () => {
    console.log('starting migration now...')
    setMigrationStarted(true)
  }, [])

  useEffect(() => {
    if (migrationStarted) {
      migrate(migration.current)
    }
  }, [migrationStarted])

  return (
    <Container>
      <Subcontainer style={{
        justifyContent: 'center'
      }}
      >
        {migrationStarted
          ? (
            <>
              <Description>
                Migration in progress. Please wait...
              </Description>
              <ActivityIndicator />
            </>
          ) : (
            <>
              <Description>
                  We need to update your identities to a new, more privacy-respecting format before continuing.
                  Please keep the app open and connected during the update.
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
