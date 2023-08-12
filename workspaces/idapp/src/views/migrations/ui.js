import styled from '@emotion/native'
import { ThemeConstants } from '~/theme'

const Container = styled.View(({ theme: { colorScheme } }) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: ThemeConstants[colorScheme].backgroundColor
}))

const Subcontainer = styled.View({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-around',
  width: '80%',
  height: '80%'
})

const Header = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].textColor,
  fontSize: 20,
  textAlign: 'center',
  marginBottom: 20
}))

const Description = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].dimmedTextColor,
  fontSize: 12,
  textAlign: 'center',
  marginBottom: 20
}))

const Row = styled.View({
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center'
})

export { Container, Subcontainer, Header, Description, Row }
