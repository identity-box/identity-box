import React, { useCallback } from 'react'
import { FadingValueBox } from '../animations'
import { Green, Blue, InfoBox, MrSpacer } from '../ui'
import { Centered } from '@react-frontend-developer/react-layout-helpers'

import { Connector } from '../identity'

const ConnectIdApp = ({ next }) => {
  const onDone = useCallback(telepathChannel => {
    console.log('Connected')
    next && next(telepathChannel)
  })

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>In order to decrypt the secret Hush Hush needs to connect to your <Blue>IdApp</Blue>.</InfoBox>
        <InfoBox marginTop='15px'>This is because the secret can be decrypted using the right private key that is stored on your mobile.</InfoBox>
        <InfoBox marginTop='15px'>The private key will never leave your mobile. <Green>It is thus super safe!</Green></InfoBox>
        <MrSpacer space='20px' />
        <InfoBox>
          Please make sure that you have your <Blue>IdApp</Blue> open on your mobile.</InfoBox>
        <MrSpacer space='50px' />
        <Connector onDone={onDone}
          title='Connect...' />
      </Centered>
    </FadingValueBox>
  )
}

export { ConnectIdApp }
