import { View } from 'react-native'

import { DiagnosticsSensor } from '~/views/diagnostics'
import { Container, Subcontainer } from './ui'
import { Backup } from './Backup'
import { FactoryReset } from './FactoryReset'
import { Version } from './Version'

const Settings = () => {
  return (
    <Container>
      <View
        style={{
          flexGrow: 1,
          height: 0
        }}
      />
      <Subcontainer>
        <Backup />
        <FactoryReset />
      </Subcontainer>
      <Version />
      <DiagnosticsSensor />
    </Container>
  )
}

export { Settings }
