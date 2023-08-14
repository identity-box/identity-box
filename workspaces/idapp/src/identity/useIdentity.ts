import { useEffect, useRef, useCallback } from 'react'
import { IdentityManager } from './IdentityManager'

import type {
  OnOwnIdentitiesChangedFunctionParams,
  OnPeerIdentitiesChangedFunctionParams,
  CurrentIdentityChangedFunctionParams
} from './IdentityManager'

type IdentityObserverType = {
  name?: string
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
  name,
  onReady,
  onPeerIdentitiesChanged,
  onOwnIdentitiesChanged,
  currentIdentityChanged
}: IdentityObserverType = {}) => {
  const identityManager = useRef<IdentityManager | undefined>(undefined)
  const subscription = useRef<number | undefined>(undefined)
  const reRenderedBeforeSubscribing = useRef(false)

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
      identityManager.current = await IdentityManager.instance(name)
      if (reRenderedBeforeSubscribing.current) {
        return
      }
      subscription.current = identityManager.current.subscribe(
        {
          onOwnIdentitiesChanged: (params) => {
            onOwnIdentitiesChanged && onOwnIdentitiesChanged(params)
          },
          onPeerIdentitiesChanged: (params) => {
            onPeerIdentitiesChanged && onPeerIdentitiesChanged(params)
          },
          currentIdentityChanged: (params) => {
            currentIdentityChanged && currentIdentityChanged(params)
          }
        },
        name
      )
      onReady && onReady(identityManager.current)
    }

    getIdentityManager()
    return () => {
      if (identityManager.current && subscription.current !== undefined) {
        identityManager.current.unsubscribe(subscription.current, name)
      } else {
        reRenderedBeforeSubscribing.current = true
      }
    }
  }, [
    onReady,
    onOwnIdentitiesChanged,
    onPeerIdentitiesChanged,
    currentIdentityChanged,
    name
  ])

  return {
    identityManager: identityManager.current,
    addPeerIdentity,
    deletePeerIdentity,
    deleteOwnIdentity
  }
}

export { useIdentity }
