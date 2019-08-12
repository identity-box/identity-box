import React from 'react'
import { PageCentered } from '@react-frontend-developer/react-layout-helpers'

import { SenderHush } from '../components/sender'

const Index = () => (
  <PageCentered css={{ color: 'black' }}>
    <div css={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center', minHeight: '150px', maxWidth: '550px', width: '85%' }}>
      <SenderHush />
    </div>
  </PageCentered>
)

export default Index
