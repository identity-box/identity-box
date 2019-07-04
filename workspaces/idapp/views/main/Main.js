import React, { useCallback } from 'react'
import styled from '@emotion/native'
import { Button } from 'react-native'

import { Telepath } from '@identity-box/telepath'

const Container = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5FCFF'
})

const Welcome = styled.Text({
  fontSize: 20,
  textAlign: 'center',
  margin: 10
})

const Main = () => {
  const onPressCallback = useCallback(
    () => {
      console.log('Creating identity...')
      const telepath = new Telepath('https://queuing.example.com')
      console.log('telepath=', telepath)
    },
    []
  )

  return (
    <Container>
      <Welcome>Create your first identity</Welcome>
      <Button
        onPress={onPressCallback}
        title='Create...'
        accessibilityLabel='Create an identity...'
      />
    </Container>
  )
}

export { Main }
