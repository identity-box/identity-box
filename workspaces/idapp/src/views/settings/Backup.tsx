import { useCallback, useEffect } from 'react'
import { router } from 'expo-router'
import { useTheme } from '@emotion/react'
import * as SecureStore from 'expo-secure-store'
import { Button } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { ThemeConstants } from '~/theme'

import { Wrapper, Header, Description, Row } from './ui'
import { useRecoilState } from 'recoil'
import { applicationConfig } from '~/app-state'

const Backup = () => {
  const [appConfig, updateAppConfig] = useRecoilState(applicationConfig)
  const { backupEnabled } = appConfig
  const { colorScheme: theme } = useTheme()

  const readBackupStatus = useCallback(async () => {
    const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
    console.log('backupEnabled=', backupEnabled)
    updateAppConfig((appConfig) => ({
      ...appConfig,
      backupEnabled: backupEnabled === 'true'
    }))
  }, [updateAppConfig])

  const onEnableBackup = useCallback(() => {
    router.push('/settings/backup-mnemonic')
  }, [])

  const onDisableBackup = useCallback(async () => {
    await SecureStore.deleteItemAsync('backupEnabled')
    await SecureStore.deleteItemAsync('backupKey')
    updateAppConfig((appConfig) => ({
      ...appConfig,
      backupEnabled: false
    }))
  }, [updateAppConfig])

  const onLearnMore = useCallback(() => {
    WebBrowser.openBrowserAsync('https://idbox.online/backups')
  }, [])

  useEffect(() => {
    readBackupStatus()
  }, [readBackupStatus])

  return (
    <Wrapper>
      <Header>Backup</Header>
      {backupEnabled ? (
        <>
          <Description>
            Backup is currently enabled. When you disable it, we will no longer
            automatically backup your identities. You can enable it again at any
            time. Your most recent backup will be preserved.
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
      ) : (
        <>
          <Description>
            By enabling backup, we will automatically backup all your
            indentities, encrypted with a backup key that will be stored on this
            mobile device.
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
      )}
    </Wrapper>
  )
}

export { Backup }
