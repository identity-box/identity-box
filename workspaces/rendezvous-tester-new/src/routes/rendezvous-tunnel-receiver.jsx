import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { RendezvousTunnel } from '@identity-box/rendezvous-client'

import { EnterTunnelId } from '../components/EnterTunnelId'
import { ReceiverMessage } from '../components/SendMessage'
import { Row, ButtonLink, Wrapper } from '../components/ui'

const msgPlaceholder = 'here will come the message'

const RendezvousTunnelReceiver = () => {
  const rendezvousTunnel = useRef(undefined)
  const [msg, setMsg] = useState(msgPlaceholder)
  const [tunnelReady, setTunnelReady] = useState(false)

  const rendezvousStart = async tunnelId => {
    rendezvousTunnel.current = new RendezvousTunnel({
      baseUrl: 'http://localhost:3100',
      onMessage: async msg => {
        console.log('msg:', msg)
        setMsg(msg)
        await rendezvousTunnel.current.send(`${msg} received!`)
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
        <p className='mb-5'>
          Now, go back to the sender tab to send the message.
        </p>}
      {tunnelReady && msg !== msgPlaceholder &&
        <p className='mb-5'>
          You can see the received message below. The tunnel is now closed. You can now close the window or reset the receiver site.
        </p>}
      {tunnelReady && <ReceiverMessage msg={msg} placeholder={msgPlaceholder} />}
      <Row cls='mt-5'>
        <ButtonLink onClick={closeWindow}>Close</ButtonLink>
        <div className='w-5' />
        {tunnelReady && <ButtonLink onClick={reset}>Reset</ButtonLink>}
      </Row>
    </Wrapper>
  )
}

export default RendezvousTunnelReceiver
