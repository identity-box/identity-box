import { useEffect, useRef } from 'react'
import { IdentityManager } from './IdentityManager'

const useIdentity = ({
  onReady,
  onPeerIdentitiesChanged,
  onOwnIdentitiesChanged,
  currentIdentityChanged
} = {}) => {
  const identityManager = useRef(undefined)
  const subscription = useRef(undefined)

  const addPeerIdentity = async ({ name, did }) => {
    await identityManager.current.addPeerIdentity({ name, did })
  }

  const deletePeerIdentity = async ({ name }) => {
    await identityManager.current.deletePeerIdentity({ name })
  }

  const getIdentityManager = async () => {
    identityManager.current = await IdentityManager.instance()
    subscription.current = identityManager.current.subscribe({
      onPeerIdentitiesChanged: params => {
        onPeerIdentitiesChanged && onPeerIdentitiesChanged(params)
      },
      onOwnIdentitiesChanged: params => {
        onOwnIdentitiesChanged && onOwnIdentitiesChanged(params)
      },
      currentIdentityChanged: params => {
        currentIdentityChanged && currentIdentityChanged(params)
      }
    })
    onReady && onReady(identityManager.current)
  }

  useEffect(() => {
    getIdentityManager()
    return () => {
      if (identityManager.current && subscription.current !== undefined) {
        identityManager.current.unsubscribe(subscription.current)
      }
    }
  }, [])

  return {
    identityManager: identityManager.current,
    addPeerIdentity,
    deletePeerIdentity
  }
}

export { useIdentity }
