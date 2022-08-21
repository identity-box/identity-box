import { useState } from 'react'

import { Row, Input, Button } from './ui'

const msgPlaceholder = 'Type your message here'

export const EnterMessage = ({ onSend }) => {
  const [msg, setMsg] = useState('')

  const onClick = e => {
    e && e.preventDefault()
    onSend && onSend(msg)
  }

  const onChange = e => {
    const msg = e.target.value
    setMsg(msg)
  }

  return (
    <>
      <p className='mb-2'>Type the message below and press <em>Send</em>. Then go to the receiver tab and see the message received there.</p>
      <p className='mb-6 pl-4 border-l-4 border-solid border-[#336e86]'><em>After you press Send, your message will be sent to the other side of the tunnel. In our demo, the receiver sends the response, which will be your message with &quot;received!&quot; appended. After receiving the response, the sender will close the tunnel.</em></p>
      <form className='w-full' onSubmit={onClick}>
        <Row>
          <Input placeholder={msgPlaceholder} type='text' value={msg} onChange={onChange} />
          <Button disabled={msg === ''} onClick={onClick}>Send</Button>
        </Row>
      </form>
    </>
  )
}
