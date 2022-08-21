import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Row, Button } from './ui'

export const Message = ({ children }) => (
  <pre className='border border-solid border-black p-5 text-base font-bold'>{children}</pre>
)

export const SendMessage = ({ onSend, disabled }) => {
  const buttonEl = useRef(null)

  const msg = {
    servicePath: 'identity-box.identity-service',
    method: 'about'
  }

  const onClick = () => {
    onSend && onSend(msg)
  }

  useEffect(() => {
    buttonEl.current.focus()
  })

  return (
    <>
      <p className='mb-2'>Press <em>Send</em> to send the following message to the Rendezvous service:</p>
      <p className='mb-6 pl-5 border-l-4 border-solid border-[#336e86]'>Before hitting &quot;Send&quot; please ensure that <code className='inline'>identity-box.box-office</code> and <code className='inline'>identity-box.identity-service</code> are running.</p>
      <Row cls='items-center'>
        <Message>{JSON.stringify(msg, undefined, 4)}</Message>
        <Button ref={buttonEl} disabled={disabled} onClick={onClick}>Send</Button>
      </Row>
    </>
  )
}

export const ReceiverMessage = ({ msg, placeholder }) => {
  const baseStyle = 'w-max-[300px] m-0 p-5 text-2xl font-normal text-black border border-solid border-black'
  if (msg === placeholder) {
    return (
      <p className={twMerge(baseStyle, 'text-gray-600')}>{placeholder}</p>
    )
  } else {
    return (
      <p className={twMerge(baseStyle, 'font-bold')}>{msg}</p>
    )
  }
}
