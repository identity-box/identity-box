import React from 'react'
import styled from '@emotion/styled'

import { Row, Button } from '../common/ui'

export const Message = styled.pre({
  border: '1px solid black',
  padding: '20px',
  fontSize: '16px',
  fontWeight: 'bold'
})

export const SendMessage = ({ onSend, disabled }) => {
  const msg = {
    servicePath: 'identity-box.identity-service',
    method: 'about'
  }

  const onClick = () => {
    onSend && onSend(msg)
  }

  return (
    <React.Fragment>
      <p style={{ marginBottom: 0 }}>Press <em>Send</em> to send the following message to the Rendezvous service:</p>
      <p style={{ marginBottom: '25px', paddingLeft: '20px', borderLeft: '5px solid #336e86' }}>Before hitting "Send" please ensure that <code style={{ display: 'inline' }}>identity-box.box-office</code> and <code style={{ display: 'inline' }}>identity-box.identity-service</code> are running</p>
      <Row style={{ alignItems: 'center' }}>
        <Message>{JSON.stringify(msg, undefined, 4)}</Message>
        <Button disabled={disabled} onClick={onClick}>Send</Button>
      </Row>
    </React.Fragment>
  )
}
