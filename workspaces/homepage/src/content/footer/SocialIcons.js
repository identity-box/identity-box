import styled from '@emotion/styled'
import { css } from '@emotion/css'
import { getImage } from 'src/assets'

const SocialIconsRow = styled.div({
  // width: '140px',
  width: '74px',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px'
})

const SocialIcon = ({ imageUrl, ...props }) => (
  <div
    className={css({
      margin: 0,
      width: '32px',
      height: '32px',
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'auto 100%',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat'
    })}
    {...props}
  />
)

const SocialIcons = ({ data }) => (
  <SocialIconsRow
    className={css({
      '@media (min-width: 568px)': {
        alignSelf: 'flex-start',
        marginLeft: '55px'
      }
    })}
  >
    <a aria-label='Twitter' href='https://twitter.com/identity_box'>
      <SocialIcon imageUrl={getImage(data, 'Twitter')} />
    </a>
    {/* <a href='https://twitter.com/identity_box'><SocialIcon imageUrl={getImage(data, 'Youtube')} className={css({ width: '46px' })} /></a> */}
    <a aria-label='GitHub' href='https://github.com/identity-box/identity-box'>
      <SocialIcon imageUrl={getImage(data, 'GitHub')} />
    </a>
  </SocialIconsRow>
)

export { SocialIcons }
