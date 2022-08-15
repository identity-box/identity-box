import { useTheme } from 'react-navigation'
import * as WebBrowser from 'expo-web-browser'
import { Button } from 'react-native'
import { ThemeConstants } from 'src/theme'

import { Container, Subcontainer, Header, Description, Row } from './ui'

const BackupNotFound = ({ navigation }) => {
  const theme = useTheme()
  const onGotIt = () => {
    navigation.navigate('RestoreFromBackup')
  }

  const onLearnMore = () => {
    WebBrowser.openBrowserAsync('https://idbox.online/backups')
  }

  return (
    <Container>
      <Subcontainer style={{
        justifyContent: 'center'
      }}
      >
        <Header>
          Something is not right...
        </Header>
        <Description>
          There is no backup on your Identity Box that matches the passphrase mnemonic that you provided.
          There are two options:
        </Description>
        <Description>
          (1) your mnemonic is wrong, or
        </Description>
        <Description>
          (2) you need to make sure that the matching
          backup is present on this Identity Box.
        </Description>
        <Row style={{ justifyContent: 'space-around' }}>
          <Button
            color={ThemeConstants[theme].accentColor}
            onPress={onGotIt}
            title='Got it'
            accessibilityLabel='Got it!'
          />
          <Button
            onPress={onLearnMore}
            title='Learn more...'
            accessibilityLabel='Learn more about automatic identity backups...'
          />
        </Row>
      </Subcontainer>
    </Container>
  )
}

export { BackupNotFound }
