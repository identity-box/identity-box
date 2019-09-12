import React, { useEffect, useState, useCallback } from 'react'
import { Text, Button } from 'react-native'
import nacl from 'tweetnacl'

import { randomBytes, entropyToMnemonic } from 'src/crypto'
import { Container, Subcontainer } from './ui'

const BackupMnemonic = ({ navigation }) => {
  const [mnemonic, setMnemonic] = useState('')

  const createBackupKey = async () => {
    const backupSecretKey = await randomBytes(nacl.box.secretKeyLength)
    const mnemonic = entropyToMnemonic(backupSecretKey)
    setMnemonic(mnemonic)
  }

  const onDismiss = useCallback(() => {
    navigation.navigate('Settings')
  }, [])

  useEffect(() => {
    createBackupKey()
  }, [])

  return (
    <Container>
      <Subcontainer>
        <Text>{mnemonic}</Text>
        <Button
          onPress={onDismiss}
          title='Got it'
          accessibilityLabel='Got it'
        />
      </Subcontainer>
    </Container>
  )
}

export { BackupMnemonic }
