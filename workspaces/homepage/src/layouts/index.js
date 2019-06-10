import { React } from 'react'
import styled from '@emotion/styled'
import { DocumentationLayout } from './documentation'

const Wrapper = styled.div({
  padding: '25px'
})

const Layout = ({ location, children }) => {
  if (location.pathname === '' || location.pathname === '/') {
    return (
      <Wrapper>{children}</Wrapper>
    )
  } else {
    return (
      <DocumentationLayout location={location}>{children}</DocumentationLayout>
    )
  }
}

export default Layout
