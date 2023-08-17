import { View } from 'react-native'
import styled from '@emotion/native'
import QRCode from 'react-native-qrcode-svg'
import { ThemeConstants } from '~/theme'

const Container = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
})

const SubContainer = styled.View({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80%',
  height: '80%'
})

const Header = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].textColor,
  fontSize: 20,
  textAlign: 'center'
}))

const Description = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].dimmedTextColor,
  fontSize: 12,
  textAlign: 'center'
}))

const IdentityName = styled.TextInput(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].textColor,
  fontSize: 24,
  fontWeight: 'bold',
  marginTop: 30,
  marginBottom: 30,
  width: '100%',
  textAlign: 'center'
}))

const Did = styled.Text(({ theme: { colorScheme } }) => ({
  fontSize: 12,
  marginTop: 20,
  width: 150,
  flexGrow: 1,
  textAlign: 'center',
  color: ThemeConstants[colorScheme].dimmedTextColor
}))

const Row = styled.View({
  flex: 1,
  flexDirection: 'row',
  width: '70%',
  justifyContent: 'space-between',
  alignItems: 'center'
})

const QRCodeThemed = ({ value, size }: { value: string; size: number }) => {
  return (
    <View
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        width: size + 10,
        height: size + 10
      }}
    >
      <QRCode value={value} size={150} />
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
