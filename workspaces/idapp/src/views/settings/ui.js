import styled from '@emotion/native'

const Container = styled.View({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center'
})

const Subcontainer = styled.View({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-around',
  width: '80%',
  height: '80%'
})

const Wrapper = styled.View({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%'
})

const Header = styled.Text({
  fontSize: 20,
  color: 'black',
  textAlign: 'center',
  marginBottom: 20
})

const Description = styled.Text({
  fontSize: 12,
  color: '#aaaaaa',
  textAlign: 'center',
  marginBottom: 20
})

const Row = styled.View({
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center'
})

export {
  Container,
  Subcontainer,
  Wrapper,
  Header,
  Description,
  Row
}
