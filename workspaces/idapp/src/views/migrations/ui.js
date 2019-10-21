import styled from '@emotion/native'
import { Themed, ThemeColors } from 'react-navigation'

const Container = styled.View(({ theme: { colorScheme: theme } }) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: ThemeColors[theme].body
}))

const Subcontainer = styled.View({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-around',
  width: '80%',
  height: '80%'
})

const Header = styled(Themed.Text)({
  fontSize: 20,
  textAlign: 'center',
  marginBottom: 20
})

const Description = styled.Text(({ theme: { colorScheme: theme } }) => ({
  fontSize: 12,
  color: theme === 'light' ? '#333' : '#ccc',
  textAlign: 'center',
  marginBottom: 20
}))

const Row = styled.View({
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center'
})

export {
  Container,
  Subcontainer,
  Header,
  Description,
  Row
}
