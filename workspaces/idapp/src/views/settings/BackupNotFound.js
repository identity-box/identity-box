import React from 'react'
import * as WebBrowser from 'expo-web-browser'
import { Button } from 'react-native'

import { Container, Subcontainer, Header, Description, Row } from './ui'

const BackupNotFound = ({ navigation }) => {
  const onGotIt = () => {
    navigation.navigate('RestoreFromBackup')
  }

  const onLearnMore = () => {
    WebBrowser.openBrowserAsync('https://idbox.online/identity-box')
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
        <Description style={{ color: '#555555' }}>
          There is no backup on your Identity Box that matches the passphrase mnemonic that you provided.
          There are two options:
        </Description>
        <Description style={{ color: '#555555' }}>
          (1) your mnemonic is wrong, or
        </Description>
        <Description style={{ color: '#555555' }}>
          (2) you need to make sure that the matching
          backup is present on this Identity Box.
        </Description>
        <Row style={{ justifyContent: 'space-around' }}>
          <Button
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
