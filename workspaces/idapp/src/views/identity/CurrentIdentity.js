import React, { useState } from 'react'

import { useIdentity } from 'src/identity'

import {
  Container,
  Description,
  Welcome
} from 'src/views/identity/ui'

const CurrentIdentity = () => {
  const [identity, setIdentity] = useState({ name: '', did: '' })

  useIdentity(identityManager => {
    setIdentity(identityManager.getCurrent())
  })

  return (
    <Container>
      <Welcome>{identity.name}</Welcome>
      <Description>{identity.did}</Description>
    </Container>
  )
}

export { CurrentIdentity }
