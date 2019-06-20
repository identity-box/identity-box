import styled from '@emotion/styled'

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

export { FooterGraphic }
