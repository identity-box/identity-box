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
//
// `clientId` should be random to some extent, preferably created when the app first starts
// and then serialized to be resused in the future sessions.
//
// Keeping the same clientId allows resubscribing even if the previous connection was not properly closed.
// If there is a new connection request coming on a new socket but from the same client id
// this connection will replace the previous socket connection.
// ClientId is therefore a bit sensitive as it allows replacing a currently open websocket
// connection to the queuing service - it should not therefore be keept in code, but
// generated a stored securely on the device.
// local testing
const getChannelDescription = async () => ({
  id: 'ZaA1XcluxtFMvVkeEIl5E2em',
  key: Buffers.copyToUint8Array(base64url.toBuffer('v85SJq-8LM4e1Jw5YIJcN7IWSZNpwTrdSDnxvexf5B0')),
  appName: 'IdentityBox',
  clientId: 'Te9J40DAW_E'
})
// idbox (marcin's rasb)
// const getChannelDescription = async () => ({
//   id: 'dAyhSOWVXwlX10cg4fqXYbw9',
//   key: Buffers.copyToUint8Array(base64url.toBuffer('ULNAoENwb-Cw6pHnkTULDbvd5jZ4jfbYUp8yV3Xz1Dw')),
//   appName: 'IdentityBox',
//   clientId: 'Te9J40DAW_E'
// })
// const getChannelDescription = async () => ({
//   id: 'ZaA1XcluxtFMvVkeEIl5E2em',
//   key: Buffers.copyToUint8Array(base64url.toBuffer('v85SJq-8LM4e1Jw5YIJcN7IWSZNpwTrdSDnxvexf5B0')),
//   appName: 'IdentityBox',
//   clientId: 'Te9J40DAW_E'
// })

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
    async () => {
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
      try {
        await channel.current.emit(message)
      } catch (e) {
        console.log(e.message)
      }
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

  const establishConnectionWithIdBox = async () => {
    const telepath = new Telepath({ serviceUrl: 'http://localhost:3000', randomBytes })
    // const telepath = new Telepath({ serviceUrl: 'https://idbox-queue.now.sh', randomBytes })
    channel.current = telepath.createChannel(await getChannelDescription())
    channel.current.describe({
      baseUrl: 'https://idbox.now.sh'
    })

    subscribe()
  }

  useEffect(() => {
    console.log('Opening telepath channel')

    establishConnectionWithIdBox()

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
