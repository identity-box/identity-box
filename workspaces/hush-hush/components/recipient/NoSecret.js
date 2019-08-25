import React from 'react'
import { Red, InfoBox, Centered } from '../ui'

const NoSecret = () => (
  <Centered>
    <InfoBox>
      <Red>Hush!</Red> Your link to get the secret does not look well to me.
    </InfoBox>
    <InfoBox>
      Please check that you copied and pasted the whole url from your email.
    </InfoBox>
    <InfoBox marginTop='20px'>
      Don't give up. Check with the sender, and keep hushing!
    </InfoBox>
  </Centered>
)

export { NoSecret }
