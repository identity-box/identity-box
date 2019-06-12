import { React } from 'react'
import styled from '@emotion/styled'
import { Global } from '@emotion/core'
import { DocumentationLayout } from './documentation'

const Wrapper = styled.div({
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'center',
  width: '100vw',
  backgroundColor: 'black'
})

const Layout = ({ location, children }) => {
  if (location.pathname === '' || location.pathname === '/') {
    return (
      <Wrapper>
        <Global styles={{ 'html,body': {
          backgroundColor: '#2F2E2D',
          margin: 0,
          padding: 0
        } }} />
        {children}
      </Wrapper>
    )
  } else {
    return (
      <DocumentationLayout location={location}>{children}</DocumentationLayout>
    )
  }
}

export default Layout
