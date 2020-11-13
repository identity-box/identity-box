/** @jsx jsx */
import { jsx } from '@emotion/react'
import styled from '@emotion/styled'
import React from 'react'

import { Row, Button } from '../common/ui'

export const Message = styled.pre({
  border: '1px solid black',
  // width: '80%',
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
      <p css={{ marginBottom: 0 }}>Press <em>Send</em> to send the following message to the Rendezvous service:</p>
      <p css={{ marginBottom: '25px', paddingLeft: '20px', borderLeft: '5px solid #336e86' }}>Before hitting "Send" please ensure that <code css={{ display: 'inline' }}>identity-box.box-office</code> and <code css={{ display: 'inline' }}>identity-box.identity-service</code> are running</p>
      <Row css={{ alignItems: 'center' }}>
        <Message>{JSON.stringify(msg, undefined, 4)}</Message>
        <Button disabled={disabled} onClick={onClick}>Send</Button>
      </Row>
    </React.Fragment>
  )
}
