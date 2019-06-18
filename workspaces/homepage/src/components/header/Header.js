import React from 'react'
import styled from '@emotion/styled'
import headerLogo from 'src/images/IdBoxHeader.png'

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

const Wrapper = styled.div({
  position: 'fixed',
  top: 0,
  zIndex: 0,
  width: '100vw',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  backgroundImage: 'linear-gradient(#2F2E2D, #000000)',
  opacity: '0.84'
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

export { Header }
