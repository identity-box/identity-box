import { useState, useRef, useCallback } from 'react'
import { router } from 'expo-router'
import { Button, ActivityIndicator } from 'react-native'
import { useTheme } from '@emotion/react'
import base64url from 'base64url'
import nacl from 'tweetnacl'

import { ThemeConstants, ThemedButton } from '~/theme'
import { randomBytes } from '~/crypto'
import { IdentityManager, useIdentity } from '~/identity'
import { useRendezvous } from '~/rendezvous'

import {
  PageContainer,
  Container,
  Welcome,
  Description,
  IdentityName
} from './ui'
import { BoxServices } from '~/box-services'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'
import { LogDb } from '../diagnostics'
import { useErrorBoundary } from 'react-error-boundary'

const FirstIdentity = () => {
  const { showBoundary } = useErrorBoundary()
  const identityManager = useRef<IdentityManager>()
  const boxServices = useRef<BoxServices>()
  const signingKeyPair = useRef<nacl.SignKeyPair>()
  const encryptionKeyPair = useRef<nacl.BoxKeyPair>()
  const [name, setName] = useState('')
  const nameRef = useRef<string>()
  const [inProgress, setInProgress] = useState(false)
  const [backupAvailable, setBackupAvailable] = useState(false)
  const { colorScheme: theme } = useTheme()

  const persistIdentity = useCallback(
    async ({ did, name: keyName }: { did: string; name: string }) => {
      try {
        if (!identityManager.current) {
          LogDb.log(
            'FirstIdentity#persistIdentity: identityManager.current is undefined!'
          )
          throw new Error('FATAL: Cannot Access Identities!')
        }
        if (!nameRef.current) {
          LogDb.log(
            'FirstIdentity#persistIdentity: nameRef.current is undefined!'
          )
          throw new Error('FATAL: Invalid (new) identity name!')
        }
        if (!(encryptionKeyPair.current && signingKeyPair.current)) {
          LogDb.log(
            'FirstIdentity#persistIdentity: encryption and signing keys are undefined!'
          )
          throw new Error('FATAL: encryption and signing keys are undefined!')
        }

        const name = nameRef.current

        const identity = {
          did,
          name,
          keyName,
          encryptionKey: encryptionKeyPair.current,
          signingKey: signingKeyPair.current
        }
        await identityManager.current.addIdentity(identity)
        await identityManager.current.setCurrent(name)
        setInProgress(false)
        router.replace('/identity/current-identity')
      } catch (e: unknown) {
        if (e instanceof Error) {
          showBoundary(e)
        } else {
          showBoundary(new Error('unknown error!'))
        }
      }
    },
    [showBoundary]
  )

  const onRendezvousReady = useCallback((rc: RendezvousClientConnection) => {
    boxServices.current = BoxServices.withConnection(rc)
    boxServices.current.checkForBackup()
  }, [])

  const onRendezvousMessage = useCallback(
    (message: RendezvousMessage) => {
      console.log(
        'received message: ',
        JSON.stringify(message, undefined, '  ')
      )
      if (
        message.method === 'create-identity-response' &&
        message.params &&
        message.params.length === 1
      ) {
        const { identity } = message.params[0] as {
          identity: { did: string; name: string }
        }
        persistIdentity(identity)
      } else if (
        message.method === 'has-backup-response' &&
        message.params &&
        message.params.length === 1
      ) {
        const { hasBackup } = message.params[0] as { hasBackup: boolean }
        setBackupAvailable(hasBackup || false)
      }
    },
    [persistIdentity]
  )

  const onRendezvousError = useCallback(
    (error: Error) => {
      console.log('error: ', error)
      LogDb.log(`FirstIdentity#onRendezvousError: ${error.message}`)
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

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
  }, [])

  useIdentity({
    onReady: onIdentityManagerReady
  })

  const createSigningKeyPair = async () => {
    const secret = await randomBytes(nacl.sign.publicKeyLength)
    nacl.setPRNG((x, n) => {
      if (n !== nacl.sign.publicKeyLength) {
        throw new Error(
          `PRNG: invalid length! Expected: ${nacl.sign.publicKeyLength}, received: ${n}`
        )
      }
      for (let i = 0; i < n; i++) {
        x[i] = secret[i]
      }
    })
    signingKeyPair.current = nacl.sign.keyPair()
    nacl.setPRNG(() => {
      throw new Error('no PRNG')
    })
  }

  const createEncryptionKeyPair = async () => {
    const secretKey = await randomBytes(nacl.box.secretKeyLength)
    encryptionKeyPair.current = nacl.box.keyPair.fromSecretKey(secretKey)
  }

  const createRandomIdentityKeyName = async () => {
    const randomValue = await randomBytes(10)
    const timestamp = Date.now()
    return `${timestamp}${base64url.encode(Buffer.from(randomValue))}`
  }

  const onCreateIdentity = useCallback(async () => {
    try {
      if (!boxServices.current) {
        LogDb.log(
          'FirstIdentity#onCreateIdentity: boxServices.current is undefined!'
        )
        throw new Error('FATAL: No Connection to Identity Box device!')
      }

      setInProgress(true)
      await createSigningKeyPair()
      await createEncryptionKeyPair()

      if (!(encryptionKeyPair.current && signingKeyPair.current)) {
        LogDb.log(
          'FirstIdentity#onCreateIdentity: encryption and signing keys are undefined!'
        )
        throw new Error('FATAL: encryption and signing keys are undefined!')
      }
      nameRef.current = name.trim()
      const keyName = await createRandomIdentityKeyName()
      const publicEncryptionKey = base64url.encode(
        Buffer.from(encryptionKeyPair.current.publicKey)
      )
      const publicSigningKey = base64url.encode(
        Buffer.from(signingKeyPair.current.publicKey)
      )
      boxServices.current.createIdentity({
        keyName,
        publicEncryptionKey,
        publicSigningKey
      })
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [name, showBoundary])

  const onRestoreFromBackup = () => {
    router.replace('/restore-from-backup')
  }

  const onScanIdBox = () => {
    router.push('/scan-idbox-modal')
  }

  return (
    <PageContainer>
      <Container
        style={{
          justifyContent: 'center'
        }}
      >
        <Welcome>Create your first identity</Welcome>
        <Description>
          Give your identity an easy to remember name. This name will not be
          shared.
        </Description>
        <IdentityName
          placeholder='Identity name...'
          onChangeText={setName}
          value={name}
        />
        {inProgress ? (
          <ActivityIndicator />
        ) : (
          <ThemedButton
            onPress={onCreateIdentity}
            title='Create...'
            disabled={name.length === 0}
            accessibilityLabel='Create an identity...'
          />
        )}
        {backupAvailable ? (
          <>
            <Description
              style={{
                marginTop: 20,
                marginBottom: 20
              }}
            >
              - OR -
            </Description>
            <Button
              color={ThemeConstants[theme].accentColor}
              onPress={onRestoreFromBackup}
              title='Restore from backup...'
              accessibilityLabel='Restore identities from backup'
            />
          </>
        ) : null}
        <Description
          style={{
            marginTop: 20,
            marginBottom: 20
          }}
        >
          - OR -
        </Description>
        <Button
          color={ThemeConstants[theme].accentColor}
          onPress={onScanIdBox}
          title='(Re)Scan Identity Box...'
          accessibilityLabel='(Re)Scan Identity Box...'
        />
      </Container>
    </PageContainer>
  )
}

export { FirstIdentity }
