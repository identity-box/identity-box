import React, { useEffect } from 'react'
import styled from '@emotion/styled'
import headerLogo from '../images/IdBoxHeader.png'
import { graphql, navigate } from 'gatsby'
import Media from 'react-media'

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
  margin: '5px 20px',
  fontSize: '10pt',
  '&:hover': {
    color: 'white',
    textDecoration: 'none'
  }
})

const IntroPanel2 = styled.div({
  width: '100%',
  height: '100vh',
  minHeight: '700px',
  // paddingTop: '20vh',
  '@media (max-height: 560px)': {
    // paddingTop: '30vh',
    minHeight: '560px'
  },
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

const Title = styled.h1({
  margin: '40px',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '36pt',
  '@media (max-width: 568px)': {
    fontSize: '22pt'
  },
  fontWeight: '200',
  color: 'white',
  textAlign: 'center'
})

const Subtitle = styled.h2({
  margin: '60px',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '20pt',
  fontWeight: '200',
  lineHeight: '1.4',
  '@media (max-width: 568px)': {
    fontSize: '12pt',
    margin: '30px'
  },
  color: 'white',
  textAlign: 'center'
})

const CubeImage = styled.div(({ imageUrl }) => ({
  width: '45%',
  paddingTop: '45%',
  '@media (min-width: 568px)': {
    width: '20%',
    paddingTop: '20%'
  },
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: '100%',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat'
}))

const IntroPanel = ({ data }) => (
  <IntroPanel2>
    <Title>Identity Box</Title>
    <CubeImage imageUrl={data.allFile.edges.filter(f => f.node.name === 'IdBoxMain')[0].node.publicURL} />
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
  flexFlow: 'column',
  justifyContent: 'center',
  alignItems: 'center',
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

const Row = styled.div({
  width: '80%',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  '@media (max-width: 1100px)': {
    flexFlow: 'column',
    justifyContent: 'center',
    textAlign: 'center'
  },
  alignItems: 'center',
  marginBottom: '30px'
})

const TextBox = styled.p({
  margin: 0,
  width: '60%',
  '@media (max-width: 1100px)': {
    width: '100%',
    marginBottom: '30px'
  },
  fontFamily: 'Helvetica Neue',
  color: 'white'
})

const Box1 = styled.div({
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  backgroundImage: 'linear-gradient(#0C3C52, #5182BD)',
  padding: '50px',
  fontSize: '12pt',
  '@media (max-width: 568px)': {
    padding: '10px',
    fontSize: '10pt'
  }
})

const Img = styled.img({
  margin: '0 0 0 0',
  width: '25%',
  height: '25%',
  minWidth: '170px',
  '@media (max-width: 400px)': {
    width: '50%',
    height: '50%',
    minWidth: '150px'
  }
})

const Img2 = styled.img({
  margin: '0 0 0 0',
  width: '40%',
  height: '40%',
  minWidth: '250px',
  '@media (max-width: 400px)': {
    width: '70%',
    height: '70%',
    minWidth: '220px'
  }
})

const getImage = (data, name) => data.allFile.edges.filter(f => f.node.name === name)[0].node.publicURL

const Home = ({ data, location }) => {
  useEffect(() => {
    if (!(location.state && location.state.authenticated)) {
      navigate('/login')
    }
  })

  return (
    <>
      <Header />
      <BodyFrame>
        <IntroPanel data={data} />
        <Box1>
          <Row>
            <TextBox>
            Most of the data today belong to just a handful of companies.
            Personal documents, photographs, videos, things that we put online in general,
            contain lots of sensitive information.
            Information that we would rather prefer to stay private.
            Very often the same companies that provide more or less
            "complimentary" storage space for our disposal, also help
            us managing our whole digital existence. The combination of
            the data and the identity information is a powerful combination
            which empowers well-established business models where
            the user's data or the user itself become a product.
            Allowing sensitive data to be kept by well-known service providers
            makes it easier than ever for illegal institutions, but also the state,
            to gain insights into the data that they have no rights to access.
            </TextBox>
            <Img src={getImage(data, 'CloudStorage')} />
          </Row>
          <Row>
            <Media query='(max-width: 1100px)'>
              {matches =>
                matches ? (
                  <>
                    <TextBox>
                    Our sensitive personal data are kept by the state, healthcare organizations,
                    financial institutions, and corporations. We do not have control over these
                    data and our access to them is limited. Every institution storing the data
                    has not only its own policies, but also uses proprietary technologies to
                    access the data. These data silos make interoperbility hard and give
                    institutions almost complete freedom to use the data without consenting the user.
                    </TextBox>
                    <Img2 src={getImage(data, 'CurrentSituation')} />
                  </>
                ) : (
                  <>
                    <Img2 src={getImage(data, 'CurrentSituation')} />
                    <TextBox css={{ width: '50%' }}>
                    Our sensitive personal data are kept by the state, healthcare organizations,
                    financial institutions, and corporations. We do not have control over these
                    data and our access to them is limited. Every institution storing the data
                    has not only its own policies, but also uses proprietary technologies to
                    access the data. These data silos make interoperbility hard and give
                    institutions almost complete freedom to use the data without consenting the user.
                    </TextBox>
                  </>
                )
              }
            </Media>
          </Row>
        </Box1>
      </BodyFrame>
    </>
  )
}

export const query = graphql`
  query {
    allFile(filter: {relativeDirectory: {glob: "**/homepage/src/images"}}) {
      edges {
        node {
          publicURL
          name
        }
      }
    }
  }
`

export default Home
