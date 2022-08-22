import { useState } from 'react'

import { Button, Row, ReceiverInput, Label } from './ui'

const EnterTunnelId = ({ onConnect }) => {
  const [tunnelId, setTunnelId] = useState('')

  const onClick = e => {
    e && e.preventDefault()
    onConnect && onConnect(tunnelId)
  }

  const onChange = e => {
    const tunnelId = e.target.value
    console.log('tunnelId=', tunnelId)
    setTunnelId(tunnelId)
  }

  return (
    <>
      <p>Paste the tunnel id below:</p>
      <Row cls='items-center'>
        <form className='w-full' onSubmit={onClick}>
          <Label>
            <p className='mt-3 mb-2 font-bold'>Tunnel id:</p>
            <Row>
              <ReceiverInput type='text' value={tunnelId} onChange={onChange} />
              <Button disabled={tunnelId === ''} onClick={onClick}>Connect</Button>
            </Row>
          </Label>
        </form>
      </Row>
    </>
  )
}

export { EnterTunnelId }
