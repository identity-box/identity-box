import React, { useEffect, useCallback, useRef } from 'react'
import base64url from 'base64url'
import styled from '@emotion/native'
import { Button } from 'react-native'
import { Buffers } from '@react-frontend-developer/buffers'
import * as Random from 'expo-random'

import { Telepath } from '@identity-box/telepath'

const randomBytes = byteCount => {
  return Random.getRandomBytesAsync(byteCount)
}

// these channel description comes from idservice/telepath.config
// we still have to think how to feed the channel information to the mobile
//
// for now remember - if idservice/telepath.config changes, you need to change
// the constants below
const getChannelDescription = () => ({
  id: 'leD1HIBwjJb9S6BA03vaxJsL',
  key: Buffers.copyToUint8Array(base64url.toBuffer('gRzs0W-Xsut6F3t6cFmMDQt3O5iKBTDWT3sgM25MmmM')),
  appName: base64url.decode('SWRlbnRpdHlCb3g')
})

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
      const message = {
        jsonrpc: '2.0',
        method: 'test',
        params: [
          1,
          'some string',
          {
            a: 'an object',
            b: 2
          }
        ]
      }
      channel.current.emit(message)
    },
    []
  )

  const channel = useRef(undefined)
  const subscription = useRef(undefined)

  const subscribe = async () => {
    console.log('subscribing...')
    subscription.current = await channel.current.subscribe(message => {
      console.log('received message: ', message)
    }, error => {
      console.log('error: ', error)
    })
  }

  const unsubscribe = () => {
    if (subscription.current) {
      channel.current.unsubscribe(subscription.current)
    }
  }

  useEffect(() => {
    console.log('Opening telepath channel')
    const telepath = new Telepath({ serviceUrl: 'https://idbox-queue.now.sh', randomBytes })
    channel.current = telepath.createChannel(getChannelDescription())
    channel.current.toString({
      baseUrl: 'https://idbox.now.sh'
    })

    subscribe()

    return () => {
      console.log('unsubscribing...')
      unsubscribe()
    }
  }, [])

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
