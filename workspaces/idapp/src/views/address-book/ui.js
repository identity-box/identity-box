import styled from '@emotion/native'

const Container = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
})

const SubContainer = styled.View({
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80%',
  height: '80%'
})

const Description = styled.Text({
  fontSize: 12,
  color: '#aaaaaa',
  textAlign: 'center'
})

const IdentityName = styled.TextInput({
  fontSize: 24,
  fontWeight: 'bold',
  marginTop: 30,
  marginBottom: 30,
  width: '100%',
  textAlign: 'center'
})

const DID = styled.Text({
  fontSize: 12,
  marginTop: 20,
  width: 150,
  flexGrow: 1,
  textAlign: 'center'
})

const Row = styled.View({
  flex: 1,
  flexDirection: 'row',
  width: '70%',
  justifyContent: 'space-between',
  alignItems: 'center'
})

export { Container,
  SubContainer,
  Description,
  IdentityName,
  DID,
  Row
}
