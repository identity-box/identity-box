import styled from '@emotion/native'

const PageContainer = styled.View({
  flex: 1,
  display: 'flex',
  flexFlow: 'column',
  justifyContent: 'center',
  alignItems: 'center'
})

const Container = styled.View({
  display: 'flex',
  flexFlow: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: '70%',
  width: '80%'
})

const Welcome = styled.Text({
  fontSize: 20,
  textAlign: 'center',
  margin: 10
})

const Description = styled.Text({
  fontSize: 12,
  textAlign: 'center'
})

const IdentityName = styled.TextInput({
  height: 40,
  marginTop: 30,
  marginBottom: 30,
  width: '100%',
  textAlign: 'center'
})

export {
  PageContainer,
  Container,
  Welcome,
  Description,
  IdentityName
}
