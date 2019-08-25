import React from 'react'
import { PageCentered } from '@react-frontend-developer/react-layout-helpers'
import { FadingValueBox } from '../components/animations'

import { RecipientHush } from '../components/recipient'

const Secret = () => (
  <PageCentered css={{ color: 'black' }}>
    <div css={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center', minHeight: '150px', maxWidth: '550px', width: '85%' }}>
      <FadingValueBox>
        <RecipientHush />
      </FadingValueBox>
    </div>
  </PageCentered>
)

export default Secret
