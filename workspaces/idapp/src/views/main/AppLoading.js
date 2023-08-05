import { ActivityIndicator } from 'react-native'

import { PageContainer, Container, Welcome, Description } from './ui'

const AppLoading = () => {
  return (
    <PageContainer>
      <Container
        style={{
          justifyContent: 'center'
        }}
      >
        <Welcome>Welcome to Identity Box App!</Welcome>
        <ActivityIndicator />
        <Description style={{ marginTop: 10 }}>Initializing...</Description>
      </Container>
    </PageContainer>
  )
}

export { AppLoading }
