import React, { useState, useRef } from 'react'
import { Button } from 'react-native'

import { useTelepath } from './useTelepath'
import { createIdentity } from './createIdentity'

import {
  Container,
  Welcome,
  Description,
  IdentityName
} from './ui'

const Identity = () => {
  const channel = useRef(undefined)
  const [name, setName] = useState('')

  channel.current = useTelepath(message => {
    console.log('received message: ', message)
  }, error => {
    console.log('error: ', error)
  })

  return (
    <Container>
      <Welcome>Create your first identity</Welcome>
      <Description>
        Give your identity an easy to remember name.
        This name will not be shared.
      </Description>
      <IdentityName
        placeholder='Some easy to remember name here...'
        onChangeText={setName}
        value={name}
      />
      <Button
        onPress={() => createIdentity({
          telepathChannel: channel.current,
          name
        })}
        title='Create...'
        disabled={name.length === 0}
        accessibilityLabel='Create an identity...'
      />
    </Container>
  )
}

export { Identity }
