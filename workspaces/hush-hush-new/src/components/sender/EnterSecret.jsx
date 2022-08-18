import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from 'semantic-ui-react'

import { FadingValueBox } from '../animations'
import { Blue, InfoBox, MrSpacer, Green, Centered } from '../ui'
import { Form, Textarea, Label } from '../forms'

const EnterSecret = ({ did, onSecretReady }) => {
  const [secret, setSecret] = useState('')
  const [disabled, setDisabled] = useState(true)
  const secretField = useRef(undefined)

  const onChange = useCallback(event => {
    const secret = event.target.value
    setSecret(secret)
    setDisabled(secret === '')
  }, [])

  const onSubmit = useCallback(event => {
    event.preventDefault()
    onSecretReady && onSecretReady({ secret })
  }, [secret])

  useEffect(() => {
    secretField.current.focus()
  })

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox><Green>You</Green> are sending secret to <Blue>{did}</Blue></InfoBox>
        <MrSpacer space='50px' />
        <InfoBox>
          Enter your secret below:
        </InfoBox>
        <Form onSubmit={onSubmit}>
          <Label htmlFor='secret'>Your secret</Label>
          <Textarea
            id='secret' ref={secretField}
            value={secret}
            placeholder='Type your secret here...'
            onChange={onChange}
          />
          <div className='self-center mt-4'>
            <Button
              primary
              disabled={disabled}
              onClick={onSubmit}
            >
              Send...
            </Button>
          </div>
        </Form>
      </Centered>
    </FadingValueBox>
  )
}

export { EnterSecret }
