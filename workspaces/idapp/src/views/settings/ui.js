import styled from '@emotion/native'

const Container = styled.View(({ theme: { theme } }) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.background
}))

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
  textAlign: 'center',
  marginBottom: 20
})

const Description = styled.Text(({ theme: { colorScheme: theme } }) => ({
  fontSize: 12,
  color: theme === 'light' ? '#555' : '#ccc',
  textAlign: 'center',
  marginBottom: 20
}))

const Row = styled.View({
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center'
})

const PassphraseMnemonicContainer = styled.View({
  width: '100%',
  height: 100,
  marginBottom: 30,
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderBottomWidth: 1,
  borderRightWidth: 1,
  paddingLeft: 5,
  paddingTop: 5,
  paddingBottom: 5,
  paddingRight: 5
})

const PassphraseMnemonic = styled.TextInput(
  ({ theme: { colorScheme: theme } }) => ({
    fontSize: 12,
    color: theme === 'light' ? 'black' : 'white',
    textAlignVertical: 'top',
    height: '100%',
    width: '100%',
    textAlign: 'left',
    backgroundColor: theme === 'light' ? 'white' : '#1a1a1a'
  })
)

const MnemonicText = styled(Themed.Text)(
  ({ theme: { colorScheme: theme } }) => ({
    paddingTop: 5,
    paddingRight: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    borderWidth: 1,
    borderColor: theme === 'light' ? 'black' : 'white',
    textAlign: 'center',
    marginBottom: 50
  })
)

export {
  Container,
  Subcontainer,
  Wrapper,
  Header,
  Description,
  Row,
  PassphraseMnemonic,
  PassphraseMnemonicContainer,
  MnemonicText
}
