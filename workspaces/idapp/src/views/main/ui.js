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

export { PageContainer, Container, Welcome, Description }
