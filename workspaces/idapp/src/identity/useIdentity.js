import { useEffect, useRef } from 'react'
import { IdentityManager } from './IdentityManager'

const useIdentity = ({ onReady, onPeerIdentityAdded } = {}) => {
  const identityManager = useRef(undefined)

  const addPeerIdentity = async ({ name, did }) => {
    const peerIdentities = await identityManager.current.addPeerIdentity({ name, did })
    onPeerIdentityAdded && onPeerIdentityAdded({
      peerIdentities,
      addedIdentity: { name, did }
    })
  }

  const getIdentityManager = async () => {
    identityManager.current = await IdentityManager.instance()
    onReady && onReady(identityManager.current)
  }

  useEffect(() => {
    getIdentityManager()
  }, [])

  return {
    identityManager: identityManager.current,
    addPeerIdentity
  }
}

export { useIdentity }
