import React from 'react'
import { View } from 'react-native'

import { DiagnosticsSensor } from 'src/views/diagnostics'
import { Container, Subcontainer } from './ui'
import { Backup } from './Backup'
import { FactoryReset } from './FactoryReset'

const Settings = ({ navigation }) => {
  const exitDiagnostics = () => {
    navigation.navigate('Settings')
  }

  return (
    <Container>
      <View style={{
        flexGrow: 1,
        height: 0
      }}
      />
      <Subcontainer>
        <Backup navigation={navigation} />
        <FactoryReset navigation={navigation} />
      </Subcontainer>
      <DiagnosticsSensor navigation={navigation} onExit={exitDiagnostics} />
    </Container>
  )
}

export { Settings }
