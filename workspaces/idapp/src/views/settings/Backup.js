import React, { useState, useCallback, useEffect } from 'react'
import { useTheme } from 'react-navigation'
import * as SecureStore from 'expo-secure-store'
import { Button } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { ThemeConstants } from 'src/theme'

import { Wrapper, Header, Description, Row } from './ui'

const Backup = ({ navigation }) => {
  const [backupEnabled, setBackupEnabled] = useState()
  const theme = useTheme()

  const readBackupStatus = async () => {
    const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
    console.log('backupEnabled=', backupEnabled)
    setBackupEnabled(backupEnabled)
  }

  const onEnableBackup = useCallback(() => {
    navigation.navigate('BackupMnemonic')
  }, [])

  const onDisableBackup = useCallback(async () => {
    await SecureStore.deleteItemAsync('backupEnabled')
    await SecureStore.deleteItemAsync('backupKey')
    setBackupEnabled(false)
  }, [])

  const onLearnMore = useCallback(() => {
    WebBrowser.openBrowserAsync('https://idbox.online/backups')
  }, [])

  useEffect(() => {
    readBackupStatus()
  })

  return (
    <Wrapper>
      <Header>Backup</Header>
      {
        backupEnabled
          ? (
            <>
              <Description>
                Backup is currently enabled. When you disable it, we will no longer automatically
                backup your identities. You can enable it again at any time. Your most recent backup will be preserved.
              </Description>
              <Row>
                <Button
                  color={ThemeConstants[theme].accentColor}
                  onPress={onDisableBackup}
                  title='Disable...'
                  accessibilityLabel='Disable automatic backup...'
                />
                <Button
                  onPress={onLearnMore}
                  title='Learn more...'
                  accessibilityLabel='Learn more about automatic identity backups...'
                />
              </Row>
            </>
            )
          : (
            <>
              <Description>
                By enabling backup, we will automatically backup all your indentities, encrypted with a backup key that will be stored on this mobile device.
              </Description>
              <Row>
                <Button
                  color={ThemeConstants[theme].accentColor}
                  onPress={onEnableBackup}
                  title='Enable...'
                  accessibilityLabel='Enable automatic backup...'
                />
                <Button
                  onPress={onLearnMore}
                  title='Learn more...'
                  accessibilityLabel='Learn more about automatic identity backups...'
                />
              </Row>
            </>
            )
      }

    </Wrapper>
  )
}

export { Backup }
