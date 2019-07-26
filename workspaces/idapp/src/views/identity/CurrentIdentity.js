import React, { useEffect, useRef, useState } from 'react'

import { IdentityManager } from './IdentityManager'

import {
  Container,
  Description,
  Welcome
} from 'src/views/identity/ui'

const CurrentIdentity = () => {
  const identityManager = useRef(undefined)

  const [identity, setIdentity] = useState({ name: '', did: '' })

  const getIdentityManager = async () => {
    identityManager.current = await IdentityManager.instance()
    setIdentity(identityManager.current.getCurrent())
  }

  useEffect(() => {
    getIdentityManager()
  }, [])

  return (
    <Container>
      <Welcome>{identity.name}</Welcome>
      <Description>{identity.did}</Description>
    </Container>
  )
}

export { CurrentIdentity }
