import { useEffect, useRef, useCallback } from 'react'
import { IdentityManager } from './IdentityManager'

import type {
  OnOwnIdentitiesChangedFunctionParams,
  OnPeerIdentitiesChangedFunctionParams,
  CurrentIdentityChangedFunctionParams
} from './IdentityManager'

type IdentityObserverType = {
  onReady?: (identityManager: IdentityManager) => void
  onOwnIdentitiesChanged?: (
    params: OnOwnIdentitiesChangedFunctionParams
  ) => void
  onPeerIdentitiesChanged?: (
    params: OnPeerIdentitiesChangedFunctionParams
  ) => void
  currentIdentityChanged?: (
    params: CurrentIdentityChangedFunctionParams
  ) => void
}

const useIdentity = ({
  onReady,
  onPeerIdentitiesChanged,
  onOwnIdentitiesChanged,
  currentIdentityChanged
}: IdentityObserverType = {}) => {
  const identityManager = useRef<IdentityManager | undefined>(undefined)
  const subscription = useRef<number | undefined>(undefined)

  const addPeerIdentity = useCallback(
    async ({ name, did }: { name: string; did: string }) => {
      await identityManager.current?.addPeerIdentity({ name, did })
    },
    []
  )

  const deletePeerIdentity = useCallback(async ({ name }: { name: string }) => {
    await identityManager.current?.deletePeerIdentity({ name })
  }, [])

  const deleteOwnIdentity = useCallback(async ({ name }: { name: string }) => {
    await identityManager.current?.deleteIdentity({ name })
  }, [])

  useEffect(() => {
    const getIdentityManager = async () => {
      identityManager.current = await IdentityManager.instance()
      subscription.current = identityManager.current.subscribe({
        onOwnIdentitiesChanged: (params) => {
          onOwnIdentitiesChanged && onOwnIdentitiesChanged(params)
        },
        onPeerIdentitiesChanged: (params) => {
          onPeerIdentitiesChanged && onPeerIdentitiesChanged(params)
        },
        currentIdentityChanged: (params) => {
          currentIdentityChanged && currentIdentityChanged(params)
        }
      })
      onReady && onReady(identityManager.current)
    }

    getIdentityManager()
    return () => {
      if (identityManager.current && subscription.current !== undefined) {
        identityManager.current.unsubscribe(subscription.current)
      }
    }
  }, [
    onReady,
    onOwnIdentitiesChanged,
    onPeerIdentitiesChanged,
    currentIdentityChanged
  ])

  return {
    identityManager: identityManager.current,
    addPeerIdentity,
    deletePeerIdentity,
    deleteOwnIdentity
  }
}

export { useIdentity }
