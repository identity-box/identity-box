import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { RendezvousTunnel } from '@identity-box/rendezvous-client'

import { EnterMessage } from '../components/EnterMessage'
import { TunnelId } from '../components/TunnelId'
import { Wrapper, Row, ButtonLink, Response } from '../components/ui'

const RendezvousTunnelSender = () => {
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
    rendezvousTunnel.current.closeTunnel()
    const { tunnelId } = await rendezvousTunnel.current.createNew()
    setReady(false)
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
      {!ready && response === '' && <p className='mb-4'>Click <em>Open Receiver</em> to go to the receiver site (the tunnel id will be automatically copied to your clipboard) or manually copy the tunnel id below and paste it in the <a className='text-red-900 hover:underline' target='_blank' href='/rendezvous-tunnel-receiver'>receiver</a> site.</p>}
      {!ready && response === '' && <TunnelId tunnelId={tunnelId} />}
      {ready && response === '' && <EnterMessage onSend={onSend} />}
      {response !== '' && <Response>{response}</Response>}
      <Row cls='mt-5'>
        <ButtonLink to='/'>Home</ButtonLink>
        <div className='w-5' />
        {response !== '' && <ButtonLink onClick={newChannel}>Create New Channel</ButtonLink>}
      </Row>
    </Wrapper>
  )
}

export default RendezvousTunnelSender
