import { useState } from 'react'

import { Button, Row } from '../../common/ui'
import { Label, Input } from './ui'

const EnterTunnelId = ({ onConnect }) => {
  const [tunnelId, setTunnelId] = useState('')

  const onClick = () => {
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
      <Row>
        <Label>
          <strong>Tunnel id:</strong>
          <Input type='text' value={tunnelId} onChange={onChange} />
        </Label>
        <Button css={{ marginLeft: '10px' }} disabled={tunnelId === ''} onClick={onClick}>Connect</Button>
      </Row>
    </>
  )
}

export { EnterTunnelId }
