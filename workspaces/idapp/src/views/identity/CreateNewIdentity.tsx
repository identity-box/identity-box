import { useState, useRef, useCallback } from 'react'
import { ActivityIndicator, Button } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import base64url from 'base64url'
import nacl from 'tweetnacl'
import { Buffers } from '@react-frontend-developer/buffers'

import { ThemedButton } from '~/theme'
import { randomBytes } from '~/crypto'
import { useRendezvous } from '~/rendezvous'
import { IdentityManager, useIdentity } from '~/identity'
import { MrSpacer } from '~/ui'

import {
  PageContainer,
  Container,
  Welcome,
  Description,
  IdentityName,
  Row
} from './ui'
import { BoxServices } from '~/box-services'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'
import { LogDb } from '../diagnostics'
import { useErrorBoundary } from 'react-error-boundary'
import { router } from 'expo-router'
import { backupIdFromBackupKey } from '~/crypto/backupIdFromBackupKey'

const CreateNewIdentity = () => {
  const { showBoundary } = useErrorBoundary()
  const identityManager = useRef<IdentityManager>()
  const boxServices = useRef<BoxServices>()
  const signingKeyPair = useRef<nacl.SignKeyPair>()
  const encryptionKeyPair = useRef<nacl.BoxKeyPair>()
  const [name, setName] = useState('')
  const nameRef = useRef<string>()
  const [inProgress, setInProgress] = useState(false)
  const [nameAlreadyExists, setNameAlreadyExists] = useState(false)

  const persistIdentity = useCallback(
    async ({ did, name: keyName }: { did: string; name: string }) => {
      try {
        if (!identityManager.current) {
          LogDb.log(
            'CreateNewIdentity#persistIdentity: identityManager.current is undefined!'
          )
          throw new Error('FATAL: Cannot Access Identities!')
        }
        if (!boxServices.current) {
          LogDb.log(
            'CreateNewIdentity#persistIdentity: boxServices.current is undefined!'
          )
          throw new Error('FATAL: No Connection to Identity Box device!')
        }
        if (!nameRef.current) {
          LogDb.log(
            'CreateNewIdentity#persistIdentity: nameRef.current is undefined!'
          )
          throw new Error('FATAL: Invalid (new) identity name!')
        }
        if (!(encryptionKeyPair.current && signingKeyPair.current)) {
          LogDb.log(
            'CreateNewIdentity#persistIdentity: encryption and signing keys are undefined!'
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
        const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
        const backupKeyBase64 = await SecureStore.getItemAsync('backupKey')
        if (backupEnabled && backupKeyBase64) {
          const backupKey = Buffers.copyToUint8Array(
            base64url.toBuffer(backupKeyBase64)
          )
          const encryptedBackup =
            await identityManager.current.createEncryptedBackupWithKey(
              backupKey
            )
          const backupId = backupIdFromBackupKey(backupKey)
          boxServices.current.writeBackupToIdBox(
            encryptedBackup,
            backupId,
            identityManager.current.keyNames
          )
        } else {
          if (router.canGoBack()) {
            router.back()
          } else {
            router.replace('/address-book/identities')
          }
        }
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
      } else if (message.method === 'backup-response') {
        if (router.canGoBack()) {
          router.back()
        } else {
          router.replace('/address-book/identities')
        }
      }
    },
    [persistIdentity]
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
          'CreateNewIdentity#onCreateIdentity: encryption and signing keys are undefined!'
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

  const onNameChanged = useCallback(
    (name: string) => {
      try {
        if (!identityManager.current) {
          LogDb.log(
            'CreateNewIdentity#persistIdentity: identityManager.current is undefined!'
          )
          throw new Error('FATAL: Cannot Access Identities!')
        }
        if (identityManager.current.identityNames.includes(name.trim())) {
          setNameAlreadyExists(true)
        } else {
          setNameAlreadyExists(false)
        }
        setName(name)
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

  const onCancel = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/identity/address-book')
    }
  }, [])

  return (
    <PageContainer>
      <Container>
        <Welcome>Create new identity</Welcome>
        <Description>
          Give your identity an easy to remember name. This name will not be
          shared.
        </Description>
        <IdentityName
          placeholder='Identity name...'
          onChangeText={onNameChanged}
          value={name}
        />
        {nameAlreadyExists ? (
          <Description style={{ color: 'red', marginBottom: 10 }}>
            You already have identity with that name...
          </Description>
        ) : (
          <MrSpacer space={25} />
        )}
        {inProgress ? (
          <ActivityIndicator />
        ) : (
          <Row style={{ justifyContent: 'space-around' }}>
            <ThemedButton
              onPress={onCreateIdentity}
              title='Create...'
              disabled={name.length === 0 || nameAlreadyExists}
              accessibilityLabel='Create an identity...'
            />
            <Button
              onPress={onCancel}
              title='Cancel'
              accessibilityLabel='Cancel'
            />
          </Row>
        )}
      </Container>
    </PageContainer>
  )
}

export { CreateNewIdentity }
