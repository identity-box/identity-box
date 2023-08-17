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
  marginBottom: 20,
  backgroundColor: ThemeConstants[colorScheme].backgroundColor
}))

const LogItem = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].textColor,
  fontSize: 12,
  padding: 5,
  textAlign: 'left'
}))

export { PageContainer, Container, LogItem }
