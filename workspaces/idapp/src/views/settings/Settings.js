import React, { useEffect, useState } from 'react'
import { Text } from 'react-native'
import nacl from 'tweetnacl'

import styled from '@emotion/native'

import { randomBytes, entropyToMnemonic } from 'src/crypto'

const Container = styled.View({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center'
})

const Subcontainer = styled.View({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80%',
  height: '80%'
})

const Description = styled.Text({
  fontSize: 12,
  color: '#aaaaaa',
  textAlign: 'center'
})

const Settings = () => {
  const [mnemonic, setMnemonic] = useState('')

  const createBackupKey = async () => {
    const backupSecretKey = await randomBytes(nacl.box.secretKeyLength)
    const mnemonic = entropyToMnemonic(backupSecretKey)
    setMnemonic(mnemonic)
  }

  useEffect(() => {
    createBackupKey()
  }, [])
  return (
    <Container>
      <Subcontainer>
        <Description>
          Example mnemonic generated from nacl secret encryption key:
        </Description>
        <Text>{mnemonic}</Text>
      </Subcontainer>
    </Container>
  )
}

export { Settings }
