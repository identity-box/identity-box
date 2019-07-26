import { useEffect, useRef } from 'react'
import { IdentityManager } from './IdentityManager'

const useIdentity = (onReady) => {
  const identityManager = useRef(undefined)

  const getIdentityManager = async () => {
    identityManager.current = await IdentityManager.instance()
    onReady && onReady(identityManager.current)
  }

  useEffect(() => {
    getIdentityManager()
  }, [])

  return identityManager.current
}

export { useIdentity }
