import styled from '@emotion/styled'
import headerLogo from 'src/images/IdBoxHeader.png'

import { MenuLinkExternal } from 'src/components/ui-blocks'

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

const HyperWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  position: 'fixed',
  top: 0,
  zIndex: 0,
  width: '100%',
  backgroundImage: 'linear-gradient(#2F2E2D, #000000)',
  opacity: '0.84'
})

const Wrapper = styled.div({
  width: '100%',
  maxWidth: '1200px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  backgroundImage: 'linear-gradient(#2F2E2D, #000000)',
  opacity: '0.84'
})

const Header = () => (
  <HyperWrapper>
    <Wrapper>
      <Logo>
        <LogoImg alt='IdBox logo' src={headerLogo} width='52px' />
        <LogoText>Identity Box</LogoText>
      </Logo>
      <Menu>
        <MenuLinkExternal href='https://github.com/identity-box/identity-box' target='_blank'>Github</MenuLinkExternal>
        <MenuLinkExternal href='https://twitter.com/identity_box' target='_blank'>Twitter</MenuLinkExternal>
        {/* <MenuLink
        css={{
          margin: '5px 20px'
        }} to='/developers/contributing' target='_blank'
      >Blog
      </MenuLink> */}
      </Menu>
    </Wrapper>
  </HyperWrapper>
)

export { Header }
