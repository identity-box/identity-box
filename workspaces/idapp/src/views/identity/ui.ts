import styled from '@emotion/native'
import { ThemeConstants } from '~/theme'

const PageContainer = styled.View(({ theme: { colorScheme } }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: ThemeConstants[colorScheme].backgroundColor
}))

const Container = styled.View(({ theme: { colorScheme } }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: '70%',
  width: '80%',
  backgroundColor: ThemeConstants[colorScheme].backgroundColor
}))

const Welcome = styled.Text({
  fontSize: 20,
  textAlign: 'center',
  margin: 10
})

const Description = styled.Text({
  fontSize: 12,
  textAlign: 'center'
})

const IdentityName = styled.TextInput(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].textColor,
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

export { PageContainer, Container, Welcome, Description, IdentityName, Row }
