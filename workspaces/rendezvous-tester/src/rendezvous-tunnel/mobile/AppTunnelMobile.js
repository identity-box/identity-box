/** @jsx jsx */
import { jsx } from '@emotion/core'
import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'

import { RendezvousTunnel } from '../../RendezvousTunnel'
import { EnterTunnelId } from './EnterTunnelId'
import { Row, ButtonLink, Wrapper } from '../../common/ui'
import { Message } from './ui'

const msgPlaceholder = 'here will come the message'

const AppTunnelMobile = () => {
  const rendezvousTunnel = useRef(undefined)
  const [msg, setMsg] = useState(msgPlaceholder)
  const [tunnelReady, setTunnelReady] = useState(false)

  const rendezvousStart = async tunnelId => {
    rendezvousTunnel.current = new RendezvousTunnel({
      baseUrl: 'http://localhost:3100',
      onMessage: msg => {
        console.log('msg:', msg)
        setMsg(msg)
        rendezvousTunnel.current.send(`${msg} received!`)
      },
      onTunnelReady: () => {
        console.log('Tunnel ready!')
        setTunnelReady(true)
      },
      onTunnelClosed: () => {
        console.log('Tunnel closed!')
      }
    })

    await rendezvousTunnel.current.connectToExisting(tunnelId)
  }

  const onConnect = tunnelId => {
    console.log('onConnect!')
    rendezvousStart(tunnelId)
  }

  const closeWindow = () => {
    window.close()
    return false
  }

  const reset = () => {
    rendezvousTunnel.current && rendezvousTunnel.current.closeLocalConnection()
    setMsg(msgPlaceholder)
    setTunnelReady(false)
  }

  useEffect(() => {
    return () => {
      console.log('closing tunnel...')
      rendezvousTunnel.current && rendezvousTunnel.current.closeLocalConnection()
    }
  }, [])

  return (
    <Wrapper>
      <Helmet>
        <title>Rendezvous Tunnel - receiver</title>
      </Helmet>
      {!tunnelReady && <EnterTunnelId onConnect={onConnect} />}
      {tunnelReady && msg === msgPlaceholder &&
        <p>
          Now, go back to the sender tab to send the message.
        </p>}
      {tunnelReady && msg !== msgPlaceholder &&
        <p>
          You can see the received message below. The tunnel is now closed. You can now close the window or reset the receiver site.
        </p>}
      {tunnelReady && <Message msg={msg} placeholder={msgPlaceholder} />}
      <Row>
        <ButtonLink onClick={closeWindow}>Close</ButtonLink>
        {tunnelReady && <ButtonLink css={{ marginLeft: '20px' }} onClick={reset}>Reset</ButtonLink>}
      </Row>
    </Wrapper>
  )
}

export { AppTunnelMobile }
