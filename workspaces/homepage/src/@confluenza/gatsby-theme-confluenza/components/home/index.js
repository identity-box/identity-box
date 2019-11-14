import { React } from 'react'
import styled from '@emotion/styled'
import { Global } from '@emotion/core'

const Wrapper = styled.div({
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100vw',
  backgroundColor: 'black'
})

const Home = ({ children }) => (
  <Wrapper>
    <Global styles={{
      'html,body': {
        backgroundColor: 'black',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }
    }}
    />
    {children}
  </Wrapper>
)

export default Home
