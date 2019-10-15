import React from 'react'
import { View } from 'react-native'
import styled from '@emotion/native'
import QRCode from 'react-native-qrcode-svg'
import { ThemeConstants } from 'src/theme'

const Container = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
})

const SubContainer = styled.View({
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80%',
  height: '80%'
})

const Description = styled.Text(({ theme: { colorScheme: theme } }) => ({
  fontSize: 12,
  color: ThemeConstants[theme].dimmedTextColor,
  textAlign: 'center'
}))

const IdentityName = styled.TextInput(({ theme: { colorScheme: theme } }) => ({
  color: theme === 'light' ? 'black' : 'white',
  fontSize: 24,
  fontWeight: 'bold',
  marginTop: 30,
  marginBottom: 30,
  width: '100%',
  textAlign: 'center'
}))

const Did = styled.Text(({ theme: { colorScheme: theme } }) => ({
  fontSize: 12,
  marginTop: 20,
  width: 150,
  flexGrow: 1,
  textAlign: 'center',
  color: ThemeConstants[theme].dimmedTextColor
}))

const Row = styled.View({
  flex: 1,
  flexDirection: 'row',
  width: '70%',
  justifyContent: 'space-between',
  alignItems: 'center'
})

const QRCodeThemed = ({ value, size }) => {
  return (
    <View style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      width: size + 10,
      height: size + 10
    }}
    >
      <QRCode
        value={value}
        size={150}
      />
    </View>
  )
}

export {
  Container,
  SubContainer,
  Description,
  IdentityName,
  Did,
  Row,
  QRCodeThemed
}
