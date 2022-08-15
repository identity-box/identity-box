import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from '@reach/router'
import { RendezvousClient } from '@identity-box/rendezvous-client'

import { Row, ButtonLink, Wrapper } from '../common/ui'
import { SendMessage, Message } from './ui'

const App = () => {
  const rendezvousClient = useRef(undefined)
  const rendezvousConnection = useRef(undefined)
  const [ready, setReady] = useState(false)
  const [response, setResponse] = useState('')

  const rendezvousStart = async () => {
    rendezvousClient.current = new RendezvousClient({
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
          <p>The received response should appear below:</p>
          <Message>{response}</Message>
        </>
      )}
      <Row>
        <Link to='/'>Home</Link>
        {response !== '' && <ButtonLink style={{ margin: '0 0 0 20px' }} onClick={newSession}>Create New Session</ButtonLink>}
      </Row>
    </Wrapper>
  )
}

export { App }
