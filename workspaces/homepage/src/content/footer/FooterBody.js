import React from 'react'
import styled from '@emotion/styled'
import Media from 'react-media'
import { getImage } from 'src/assets'
import { MenuLink, MenuLinkExternal as MenuLinkExternalOriginal } from 'src/components/ui-blocks'

import { FooterRow } from './FooterRow'
import { FooterMenu } from './FooterMenu'
import { FooterGraphic } from './FooterGraphic'

const MenuLinkExternal = styled(MenuLinkExternalOriginal)({
  margin: 0
})

const FooterBody = ({ data }) => (
  <FooterRow css={{
    '@media (min-width: 568px)': {
      alignSelf: 'flex-start',
      marginLeft: '55px'
    }
  }}
  >
    <FooterMenu
      title='Identity Box' css={{
        alignSelf: 'flex-start'
      }}
    >
      <MenuLink to='/identity-box'>About</MenuLink>
      <MenuLink to='/experience-identity-box'>Early Access</MenuLink>
    </FooterMenu>
    <FooterMenu
      title='Documentation' css={{
        alignSelf: 'flex-start',
        '@media (min-width: 568px)': {
          marginLeft: '80px'
        }
      }}
    >
      <MenuLink to='/components/idbox-react-ui'>Components</MenuLink>
      <MenuLink to='/services/idservice'>Services</MenuLink>
      <MenuLink to='/developers/contributing'>Contributing</MenuLink>
    </FooterMenu>
    <Media
      query='(min-width: 800px)' render={() => (
        <FooterGraphic imageUrl={getImage(data, 'IdBoxFooterGraphic')} />
      )}
    />
  </FooterRow>
)

export { FooterBody }
