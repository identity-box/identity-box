import React from 'react'
import styled from '@emotion/styled'
import Media from 'react-media'
import { getImage } from 'src/assets'
import { Box, Row, MenuLink, MenuLinkExternal as MenuLinkExternalOriginal } from 'src/components/ui-blocks'

const MenuLinkExternal = styled(MenuLinkExternalOriginal)({
  margin: 0
})

const FooterRow = styled.div({
  width: '90%',
  maxWidth: '1000px',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  '@media (max-width: 568px)': {
    justifyContent: 'space-between'
  },
  alignItems: 'center',
  marginBottom: '30px'
})

const SocialIconsRow = styled.div({
  width: '140px',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px'
})

const SocialIcon = ({ imageUrl, ...props }) => (
  <div css={{
    margin: 0,
    width: '32px',
    height: '32px',
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'auto 100%',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat'
  }} {...props} />
)

const FooterGraphic = styled.div(({ imageUrl }) => ({
  marginLeft: 'auto',
  width: '300px',
  height: '125px',
  '@media (max-width: 1000px)': {
    width: '200px',
    height: '83px'
  },
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: 'auto 100%',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat'
}))

const FooterMenu = ({ title, children, ...rest }) => (
  <div css={{
    display: 'flex',
    flexFlow: 'column',
    fontFamily: 'Roboto Mono, monospace',
    fontSize: '10pt'
  }} {...rest} >
    <h3 css={{
      margin: 0,
      color: 'white',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '10pt',
      fontWeight: 400
    }}>{title}</h3>
    <Items>
      { React.Children.map(children, child => (
        <Li>{child}</Li>
      ))}
    </Items>
  </div>
)

const Li = styled.li({
  listStyleType: 'none',
  margin: '10px 0',
  '@media (max-width: 568px)': {
    margin: '5px 0'
  },
  padding: 0
})

const Items = styled.ul({
  margin: '0 0 5px 0'
})

const Footer = ({ data }) => (
  <Box backgroundStyles={{
    position: 'relative',
    paddingBottom: 0,
    backgroundImage: 'linear-gradient(#092C3E, #000000)',
    '@media (max-width: 568px)': {
      paddingTop: '20px'
    }
  }}>
    <FooterRow css={{
      '@media (min-width: 568px)': {
        alignSelf: 'flex-start',
        marginLeft: '55px'
      }
    }}>
      <FooterMenu title='Identity Box'>
        <MenuLink to='/developers/contributing'>About</MenuLink>
        <MenuLinkExternal href='https://youtu.be/aqAUmgE3WyM' target='_blank'>Demo</MenuLinkExternal>
        <MenuLink to='/developers/contributing'>Buy</MenuLink>
      </FooterMenu>
      <FooterMenu title='Documentation' css={{
        '@media (min-width: 568px)': {
          marginLeft: '80px'
        }
      }}>
        <MenuLink to='/developers/contributing'>User guide</MenuLink>
        <MenuLink to='/developers/contributing'>Blog</MenuLink>
        <MenuLink to='/developers/contributing'>Developers</MenuLink>
      </FooterMenu>
      <Media query='(min-width: 800px)' render={() => (
        <FooterGraphic imageUrl={getImage(data, 'IdBoxFooterGraphic')} />
      )} />
    </FooterRow>
    <SocialIconsRow css={{
      '@media (min-width: 568px)': {
        alignSelf: 'flex-start',
        marginLeft: '55px'
      }
    }}>
      <SocialIcon imageUrl={getImage(data, 'Twitter')} />
      <SocialIcon imageUrl={getImage(data, 'Youtube')} css={{ width: '46px' }} />
      <SocialIcon imageUrl={getImage(data, 'GitHub')} />
    </SocialIconsRow>
    <Row>
      <p css={{
        color: 'white',
        fontFamily: 'Roboto Mono, monospace',
        fontSize: '10pt',
        margin: 0
      }}><span css={{
          fontSize: '14pt'
        }}>&copy;</span> 2019 Identity Box</p>
    </Row>
  </Box>
)

export { Footer }
