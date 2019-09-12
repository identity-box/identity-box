import React, { useEffect, useState, useCallback } from 'react'
import { Button } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

import { Wrapper, Header, Description, Row } from './ui'

const Backup = ({ navigation }) => {
  const [backupEnabled, setBackupEnabled] = useState()

  const onEnableBackup = useCallback(() => {
    navigation.navigate('BackupMnemonic')
  }, [])

  const onLearnMore = useCallback(() => {
    WebBrowser.openBrowserAsync('https://idbox.online/identity-box')
  }, [])

  return (
    <Wrapper>
      <Header>Backup</Header>
      <Description>
        By enabling backup, we will automatically backup all your indentities, encrypted with a backup key that will be stored on this mobile device.
      </Description>
      <Row>
        <Button
          onPress={onEnableBackup}
          title='Enable...'
          disabled={backupEnabled}
          accessibilityLabel='Enable automatic backup...'
        />
        <Button
          onPress={onLearnMore}
          title='Learn more...'
          accessibilityLabel='Learn more about automatic identity backups...'
        />
      </Row>
    </Wrapper>
  )
}

export { Backup }
