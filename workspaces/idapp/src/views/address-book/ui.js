import React from 'react'
import { View } from 'react-native'
import { Themed } from 'react-navigation'
import styled from '@emotion/native'
import QRCode from 'react-native-qrcode-svg'
import { ThemeConstants } from 'src/theme'

const Container = styled.View({
  flex: 1
})

const SubContainer = styled.View({
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80%',
  height: '80%'
})

const Header = styled(Themed.Text)({
  fontSize: 20,
  textAlign: 'center',
  color: 'white'
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

const ListContainer = styled.View({
  width: '100%',
  height: '50%'
})

export {
  Container,
  SubContainer,
  Header,
  Description,
  IdentityName,
  Did,
  Row,
  QRCodeThemed,
  ListContainer
}
