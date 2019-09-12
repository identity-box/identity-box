import React from 'react'

import { Container, Subcontainer } from './ui'
import { Backup } from './Backup'

const Settings = ({ navigation }) => {
  return (
    <Container>
      <Subcontainer>
        <Backup navigation={navigation} />
      </Subcontainer>
    </Container>
  )
}

export { Settings }
