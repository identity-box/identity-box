import React from 'react'
import { Text } from 'react-native'
import styled from '@emotion/native'
import QRCode from 'react-native-qrcode-svg'

const Container = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
})

const SubContainer = styled.View({
  // flex: 1,
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80%',
  height: '80%'
})

const IdentityName = styled.Text({
  fontSize: 32,
  fontWeight: 'bold',
  marginBottom: 20
})

const DID = styled.Text({
  fontSize: 12,
  marginBottom: 20,
  flexGrow: 1,
  textAlign: 'center'
})

const IdentityDetails = ({ navigation }) => {
  const name = navigation.getParam('name', '')
  const did = navigation.getParam('did', '')
  return (
    <Container>
      <SubContainer>
        <IdentityName>{name}</IdentityName>
        <DID>{did}</DID>
        <QRCode
          value={did}
          size={150}
        />
      </SubContainer>
    </Container>
  )
}

export { IdentityDetails }
