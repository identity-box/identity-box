import React, { useCallback } from 'react'
import { FadingValueBox } from '../animations'
import { Blue, InfoBox, MrSpacer } from '../ui'
import { Centered } from '@react-frontend-developer/react-layout-helpers'

import { Connector } from '../identity'

const Recipient = () => {
  const onDone = useCallback(() => {
    console.log('Connected')
  })

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>You need to tell Hush Hush who is the intended recipient of your secret.</InfoBox>
        <InfoBox>
          For this reason, Hush Hush, needs to connect to your mobile where you can then
          select the intended recipient from your <Blue>Identity Box IdApp Address Book</Blue>.
        </InfoBox>
        <MrSpacer space='50px' />
        <Connector onDone={onDone}
          title='Connect...' />
      </Centered>
    </FadingValueBox>
  )
}

export { Recipient }
