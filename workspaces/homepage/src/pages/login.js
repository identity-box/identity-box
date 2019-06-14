import React, { useState } from 'react'
import styled from '@emotion/styled'
import { navigate } from 'gatsby'
import Helmet from 'react-helmet'
import nacl from 'tweetnacl'
import { TypedArrays } from '@react-frontend-developer/buffers'

import { FadingValueBox } from 'src/components/animations'
import { Form, Input, Label, Button } from 'src/components/forms'

const LoginWrapper = styled.div({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundImage: 'url(/galaxy-1.jpg)',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: '100% 100%',
  color: 'white'
})

const loginSecret = 'f674c5d906306e7fde4f05d59b0cd043011c5399a1b0691f315610d99ff8a92c9e52ab843c25d9c4155d62b8d148a4735bcda27315242173475ca273e6a37f2b'

const Login = () => {
  const [secret, setSecret] = useState('')

  const onChange = event => {
    setSecret(event.target.value)
  }

  const hash = secret => {
    const h = nacl.hash(TypedArrays.string2Uint8Array(secret, 'utf8'))
    return TypedArrays.uint8Array2string(h, 'hex')
  }

  const login = event => {
    if (hash(secret) === loginSecret) {
      navigate(`/`, {
        state: {
          authenticated: true
        }
      })
    } else {
      setSecret('')
    }
    event.preventDefault()
  }

  return (
    <LoginWrapper>
      <Helmet title='Identity Box - Login'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0' />
        <link href='https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap' rel='stylesheet' />
      </Helmet>
      <div css={{
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '300px',
        width: '80%'
      }}>
        <FadingValueBox>
          <Form onSubmit={login} css={{
            display: 'flex',
            flexFlow: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Label htmlFor='frmSecretA'>Look into the future:</Label>
            <Input autoFocus id='frmSecretA' type='password'
              name='secret'
              value={secret}
              placeholder='something only you know...'
              required
              onChange={onChange}
              autocomplete='current-password'
              css={{
                marginBottom: '10px'
              }}
            />
            <Button type='submit' value='Enter the future' />
          </Form>
        </FadingValueBox>
      </div>
    </LoginWrapper>
  )
}

export default Login
