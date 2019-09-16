import React from 'react'

import { Container, Subcontainer } from './ui'
import { Backup } from './Backup'
import { FactoryReset } from './FactoryReset'

const Settings = ({ navigation }) => {
  return (
    <Container>
      <Subcontainer>
        <Backup navigation={navigation} />
        <FactoryReset navigation={navigation} />
      </Subcontainer>
    </Container>
  )
}

export { Settings }
