import styled from '@emotion/native'

const PageContainer = styled.View(({ theme: { theme } }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.background
}))

const Container = styled.View(({ theme: { theme } }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: '70%',
  width: '80%',
  backgroundColor: theme.colors.background
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
