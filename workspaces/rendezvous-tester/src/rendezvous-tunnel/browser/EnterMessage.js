/** @jsx jsx */
import React from 'react'
import { jsx } from '@emotion/react'
import { useState } from 'react'

import { Row, Input, Button } from '../../common/ui'

const msgPlaceholder = 'Type your message here'

export const EnterMessage = ({ onSend }) => {
  const [msg, setMsg] = useState('')

  const onClick = () => {
    onSend && onSend(msg)
  }

  const onChange = e => {
    const msg = e.target.value
    setMsg(msg)
  }

  return (
    <React.Fragment>
      <p css={{ marginBottom: 0 }}>Type the message below and press <em>Send</em>. Then go to the receiver tab and see the message received there.</p>
      <p css={{ marginBottom: '25px' }}><em>After you press Send, your message will be sent to the other side of the tunnel. In our demo, the receiver sends the response, which will be your message with "received!" appended. After receiving the response, the sender will close the current tunnel.</em></p>
      <Row>
        <Input placeholder={msgPlaceholder} type='text' value={msg} onChange={onChange} />
        <Button disabled={msg === ''} onClick={onClick}>Send</Button>
      </Row>
    </React.Fragment>
  )
}
