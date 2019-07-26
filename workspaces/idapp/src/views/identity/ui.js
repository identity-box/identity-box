import styled from '@emotion/native'

const Container = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5FCFF'
})

const Welcome = styled.Text({
  fontSize: 20,
  textAlign: 'center',
  margin: 10
})

const Description = styled.Text({
  fontSize: 12,
  width: '60%',
  textAlign: 'center',
  margin: 10
})

const IdentityName = styled.TextInput({
  height: 40,
  width: '60%',
  marginTop: 30,
  marginBottom: 30,
  textAlign: 'center'
})

export {
  Container,
  Welcome,
  Description,
  IdentityName
}
