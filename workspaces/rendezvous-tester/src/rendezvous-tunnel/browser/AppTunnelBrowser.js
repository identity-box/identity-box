/** @jsx jsx */
import { jsx } from '@emotion/core'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@reach/router'
import { Helmet } from 'react-helmet-async'
import { RendezvousTunnel } from '@identity-box/rendezvous-client'

import { EnterMessage } from './EnterMessage'
import { Row, ButtonLink } from '../../common/ui'
import { Wrapper, TunnelId, Response } from './ui'

const AppTunnelBrowser = () => {
  const rendezvousTunnel = useRef(undefined)
  const [ready, setReady] = useState(false)
  const [response, setResponse] = useState('')
  const [tunnelId, setTunnelId] = useState('')

  const rendezvousStart = async () => {
    rendezvousTunnel.current = new RendezvousTunnel({
      baseUrl: 'http://localhost:3100',
      onMessage: response => {
        console.log('msg response:', response)
        setResponse(response)
        rendezvousTunnel.current.closeTunnel()
      },
      onTunnelReady: () => {
        setReady(true)
        if (window.getSelection) {
          if (window.getSelection().empty) { // Chrome
            window.getSelection().empty()
          } else if (window.getSelection().removeAllRanges) { // Firefox
            window.getSelection().removeAllRanges()
          }
        }
      },
      onOtherEndNotReady: () => {
        setReady(false)
      },
      onTunnelClosed: async () => {
        console.log('Tunnel closed!')
      }
    })
    const { tunnelId } = await rendezvousTunnel.current.createNew()
    setTunnelId(tunnelId)
  }

  const onSend = async msg => {
    setReady(false)
    await rendezvousTunnel.current.send(msg)
  }

  const newChannel = async () => {
    setReady(false)
    const tunnelId = await rendezvousTunnel.current.createNew()
    setResponse('')
    setTunnelId(tunnelId)
  }

  useEffect(() => {
    rendezvousStart()
    return () => {
      rendezvousTunnel.current.closeTunnel()
    }
  }, [])

  return (
    <Wrapper>
      <Helmet>
        <title>Rendezvous Tunnel - sender</title>
      </Helmet>
      {!ready && response === '' && <p>Copy the tunnel id below and paste it in the <a target='_blank' href='/rendezvous-tunnel-mobile'>receiver</a> site.</p>}
      {!ready && response === '' && <TunnelId>{tunnelId}</TunnelId>}
      {ready && response === '' && <EnterMessage onSend={onSend} />}
      {response !== '' && <Response>{response}</Response>}
      <Row>
        <Link css={{ display: 'block', margin: '20px 20px 20px 0' }} to='/'>Home</Link>
        {response !== '' && <ButtonLink onClick={newChannel}>Create New Channel</ButtonLink>}
      </Row>
    </Wrapper>
  )
}

export { AppTunnelBrowser }
