import styled from '@emotion/native'
import { Themed, ThemeColors } from 'react-navigation'

const PageContainer = styled.View(({ theme: { colorScheme: theme } }) => ({
  flex: 1,
  display: 'flex',
  flexFlow: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: ThemeColors[theme].body
}))

const Container = styled.View(({ theme: { colorScheme: theme } }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: '70%',
  width: '80%',
  backgroundColor: ThemeColors[theme].body
}))

const Welcome = styled(Themed.Text)({
  fontSize: 20,
  textAlign: 'center',
  margin: 10
})

const Description = styled(Themed.Text)({
  fontSize: 12,
  textAlign: 'center'
})

const IdentityName = styled.TextInput(({ theme: { colorScheme: theme } }) => ({
  color: theme === 'light' ? 'black' : 'white',
  height: 40,
  marginTop: 30,
  marginBottom: 30,
  width: '100%',
  fontSize: 24,
  textAlign: 'center'
}))

const Row = styled.View({
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center'
})

export {
  PageContainer,
  Container,
  Welcome,
  Description,
  IdentityName,
  Row
}
