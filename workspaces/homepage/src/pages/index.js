import React from 'react'
import styled from '@emotion/styled'
import headerLogo from '../images/IdBoxHeader.png'
import { graphql } from 'gatsby'

const Wrapper = styled.div({
  position: 'fixed',
  top: 0,
  width: '100vw',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  backgroundImage: 'linear-gradient(#2F2E2D, #000000)',
  opacity: '0.84'
})

const Menu = styled.div({
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-end',
  alignItems: 'center'
})

const MenuItem = styled.a({
  display: 'inline-block',
  color: '#D20DE7',
  fontFamily: 'Roboto Mono, monospace',
  margin: '30px 20px',
  fontSize: '10pt',
  '&:hover': {
    color: 'white',
    textDecoration: 'none'
  }
})

const IntroPanel2 = styled.div({
  width: '100%',
  height: '100vh',
  paddingTop: '20vh',
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start'
})

const Title = styled.h1({
  margin: '40px',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '36pt',
  '@media (max-width: 450px)': {
    fontSize: '26pt'
  },
  color: 'white',
  textAlign: 'center'
})

const Subtitle = styled.h2({
  margin: '60px',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '20pt',
  lineHeight: '1.4',
  '@media (max-width: 450px)': {
    fontSize: '14pt'
  },
  color: 'white',
  textAlign: 'center'
})

const CubeImage = styled.div(({ imageUrl }) => ({
  width: '50%',
  paddingTop: '50%',
  '@media (min-width: 450px)': {
    width: '30%',
    paddingTop: '30%'
  },
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: '100%',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat'
}))

const IntroPanel = ({ data }) => (
  <IntroPanel2>
    <Title>Identity Box</Title>
    <CubeImage imageUrl={data.file.publicURL} />
    <Subtitle>Decentralized Web of the Future</Subtitle>
  </IntroPanel2>
)

const Logo = styled.div({
  display: 'flex',
  flexFlow: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  margin: '20px'
})

const LogoImg = styled.img({
  margin: 0
})

const LogoText = styled.p({
  display: 'inline-block',
  margin: 0,
  color: 'white',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '10pt',
  marginLeft: '20px',
  whiteSpace: 'nowrap'
})

const BodyFrame = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  width: '100vw',
  minWidth: '300px'
})

const Header = () => (
  <Wrapper>
    <Logo>
      <LogoImg alt='IdBox logo' src={headerLogo} width='52px' />
      <LogoText>Identity Box</LogoText>
    </Logo>
    <Menu>
      <MenuItem href='https://github.com/marcinczenko/identity-box' target='_blank'>Github</MenuItem>
      <MenuItem href='https://twitter.com/identity_box' target='_blank'>Twitter</MenuItem>
      <MenuItem href='http://marcinczenko.github.io' target='_blank'>Blog</MenuItem>
    </Menu>
  </Wrapper>
)

const Home = ({ data }) => (
  <>
    <Header />
    <BodyFrame>
      <IntroPanel data={data} />
    </BodyFrame>
  </>
)

export const query = graphql`
  query {
    file(base: { eq: "IdBoxMain.png" }) {
      publicURL
    }
  }
`

export default Home
