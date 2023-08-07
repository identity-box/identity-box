import { useCallback, useRef } from 'react'

import nacl from 'tweetnacl'
import base64url from 'base64url'

import { router } from 'expo-router'

import { RendezvousTunnel } from '@identity-box/rendezvous-client'
import type { RendezvousMessage } from '@identity-box/rendezvous-client'

import { useRendezvousTunnel } from '~/rendezvous'

import { randomBytes } from '~/crypto'
import { IdentityManager, useIdentity } from '~/identity'

type BrowserConnectionDesciptor = {
  url: string | undefined
  tunnelId: string | undefined
  onConnectionClosed?: ({ status }: { status?: string }) => void
}

const useBrowserConnection = ({
  url,
  tunnelId,
  onConnectionClosed
}: BrowserConnectionDesciptor) => {
  const identityManager = useRef<IdentityManager | undefined>(undefined)
  const rendezvousTunnel = useRef<RendezvousTunnel | undefined>(undefined)

  const onReady = useCallback((rt: RendezvousTunnel) => {
    console.log('TUNNER READY')
    rendezvousTunnel.current = rt
  }, [])

  const sendCurrentIdentity = async (currentDid: string) => {
    const message = {
      method: 'get_current_identity_response',
      params: [{ currentDid }]
    }
    try {
      await rendezvousTunnel.current?.send(message)
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(e.message)
      } else {
        console.warn('Unknown Error!')
      }
    }
  }

  const sendEncryptedContent = async (encryptedContentRecord: {
    encryptedContent: string
    nonce: string
  }) => {
    const message = {
      method: 'encrypt_content_response',
      params: [encryptedContentRecord]
    }
    try {
      await rendezvousTunnel.current?.send(message)
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(e.message)
      } else {
        console.warn('Unknown Error!')
      }
    }
  }

  const sendDecryptedContent = async (decryptedContent: string) => {
    const message = {
      method: 'decrypt_content_response',
      params: [
        {
          decryptedContent
        }
      ]
    }
    try {
      await rendezvousTunnel.current?.send(message)
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(e.message)
      } else {
        console.warn('Unknown Error!')
      }
    }
  }

  const sendErrorMessage = async (errorID: string) => {
    const message = {
      method: 'decrypt_content_error',
      params: [
        {
          errorID
        }
      ]
    }
    try {
      await rendezvousTunnel.current?.send(message)
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(e.message)
      } else {
        console.warn('Unknown Error!')
      }
    }
  }

  const onMessage = useCallback(
    async (message: RendezvousMessage) => {
      try {
        if (!identityManager.current) {
          throw new Error('fatal error: identityManager.current is undefined!')
        }
        const identity = identityManager.current.getCurrent()
        if (!identity) {
          throw new Error(
            'fatal error: identityManager.current.getCurrent() returns undefined'
          )
        }
        console.log('received message: ', message)
        if (message.method === 'get_current_identity') {
          sendCurrentIdentity(identity.did)
        } else if (message.method === 'select_identity') {
          router.push({
            pathname: '/identity/select-identity',
            params: { tunnelId, rendezvousUrl: url }
          })
        } else if (
          message.method === 'encrypt-content' &&
          message.params.length > 0
        ) {
          const { content, theirPublicKey } = message.params[0]
          const nonce = await randomBytes(nacl.box.nonceLength)
          const mySecretKey = identity.encryptionKey.secretKey
          const messageBuffer = base64url.toBuffer(content as string)
          const encryptedContent = nacl.box(
            messageBuffer,
            nonce,
            base64url.toBuffer(theirPublicKey as string),
            mySecretKey
          )
          await sendEncryptedContent({
            encryptedContent: base64url.encode(Buffer.from(encryptedContent)),
            nonce: base64url.encode(Buffer.from(nonce))
          })
          onConnectionClosed &&
            onConnectionClosed({ status: 'encypt-content successful' })
        } else if (
          message.method === 'decrypt-content' &&
          message.params.length > 0
        ) {
          const {
            encryptedContentBase64,
            nonceBase64,
            theirPublicKeyBase64,
            didRecipient
          } = message.params[0]
          const box = base64url.toBuffer(encryptedContentBase64 as string)
          const nonce = base64url.toBuffer(nonceBase64 as string)
          const theirPublicKey = base64url.toBuffer(
            theirPublicKeyBase64 as string
          )
          const myIdentity = identityManager.current.fromDID(
            didRecipient as string
          )
          if (myIdentity) {
            const mySecretKey = myIdentity.encryptionKey.secretKey
            console.log('box=', box)
            console.log('nonce=', nonce)
            console.log('theirPublicKey=', theirPublicKey)
            console.log('mySecretKey=', mySecretKey)
            const decryptedContent = nacl.box.open(
              box,
              nonce,
              theirPublicKey,
              mySecretKey
            )
            if (!decryptedContent) {
              throw new Error('fatal error: could not decrypt the message!')
            }
            console.log('decryptedContent=', decryptedContent)
            await sendDecryptedContent(
              base64url.encode(Buffer.from(decryptedContent))
            )
            onConnectionClosed &&
              onConnectionClosed({ status: 'decrypt-content successful' })
          } else {
            await sendErrorMessage('NO-MATCHING-IDENTITY-FOUND')
            onConnectionClosed &&
              onConnectionClosed({ status: 'NO-MATCHING-IDENTITY-FOUND' })
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.warn(e.message)
          onConnectionClosed && onConnectionClosed({ status: e.message })
        } else {
          console.warn('Unknown Error!')
          onConnectionClosed && onConnectionClosed({ status: 'Unknown Error!' })
        }
      }
    },
    [tunnelId, url, onConnectionClosed]
  )

  const onError = useCallback((error: Error) => {
    console.log('error: ', error)
  }, [])

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
  }, [])

  useIdentity({
    onReady: onIdentityManagerReady
  })

  useRendezvousTunnel({
    url,
    tunnelId,
    onReady,
    onMessage,
    onError
  })
  return null
}

export { useBrowserConnection }
