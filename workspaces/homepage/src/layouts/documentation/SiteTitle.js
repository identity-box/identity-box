import { React } from 'react'
import styled from '@emotion/styled'
import { Link } from 'gatsby'

const Wrapper = styled.div({
  backgroundColor: 'black',
  color: 'white',
  fontFamily: 'Roboto Mono, monospace',
  fontWeight: '300',
  fontSize: '1.2rem',
  lineHeight: '1.8rem',
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '10px',
  marginBottom: '2rem'
})

const HomeLink = styled(Link)({
  color: 'white',
  fontWeight: '300',
  '&:hover': {
    color: 'white',
    textDecoration: 'none'
  }
})

const SiteTitle = ({ title }) => (
  <HomeLink to='/'>
    <Wrapper>
      { title }
    </Wrapper>
  </HomeLink>
)

export { SiteTitle }
