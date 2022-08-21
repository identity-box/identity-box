import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { RendezvousClient as RC } from '@identity-box/rendezvous-client'

import { Row, Wrapper, ButtonLink } from '../components/ui'
import { SendMessage, Message } from '../components/SendMessage'

const RendezvousClient = () => {
  const rendezvousClient = useRef(undefined)
  const rendezvousConnection = useRef(undefined)
  const [ready, setReady] = useState(false)
  const [response, setResponse] = useState('')

  const rendezvousStart = async () => {
    rendezvousClient.current = new RC({
      baseUrl: 'http://localhost:3100',
      onMessage: msg => {
        console.log('msg response:', msg)
        setResponse(JSON.stringify(msg, undefined, 4))
      },
      onSessionEnded: reason => {
        console.log('Session ended:', reason)
      }
    })

    rendezvousConnection.current = await rendezvousClient.current.connect()
    setReady(true)
  }

  const onSend = async msg => {
    console.log('onSend[1]')
    await rendezvousConnection.current.send(msg)
  }

  const newSession = async () => {
    setReady(false)
    rendezvousConnection.current = await rendezvousClient.current.connect()
    setReady(true)
    setResponse('')
  }

  useEffect(() => {
    rendezvousStart()
    return () => {
      rendezvousConnection.current.end()
    }
  }, [])

  return (
    <Wrapper>
      <Helmet>
        <title>Rendezvous</title>
      </Helmet>
      {ready && response === '' && <SendMessage onSend={onSend} disabled={!ready} />}
      {response !== '' && (
        <>
          <p className='mb-3'>The received response should appear below:</p>
          <Message>{response}</Message>
        </>
      )}
      <Row cls='pt-5'>
        <ButtonLink to='/'>Home</ButtonLink>
        <div className='w-5' />
        {response !== '' && <ButtonLink onClick={newSession}>Create New Session</ButtonLink>}
      </Row>
    </Wrapper>
  )
}

export default RendezvousClient
