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
    <FooterMenu title='Identity Box'>
      <MenuLink to='/developers/contributing'>About</MenuLink>
      <MenuLinkExternal href='https://youtu.be/aqAUmgE3WyM' target='_blank'>Demo</MenuLinkExternal>
      <MenuLink to='/developers/contributing'>Buy</MenuLink>
    </FooterMenu>
    <FooterMenu
      title='Documentation' css={{
        '@media (min-width: 568px)': {
          marginLeft: '80px'
        }
      }}
    >
      <MenuLink to='/developers/contributing'>User guide</MenuLink>
      <MenuLink to='/developers/contributing'>Blog</MenuLink>
      <MenuLink to='/developers/contributing'>Developers</MenuLink>
    </FooterMenu>
    <Media
      query='(min-width: 800px)' render={() => (
        <FooterGraphic imageUrl={getImage(data, 'IdBoxFooterGraphic')} />
      )}
    />
  </FooterRow>
)

export { FooterBody }
