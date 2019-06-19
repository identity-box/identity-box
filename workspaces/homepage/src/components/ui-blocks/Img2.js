import styled from '@emotion/styled'

const Img2 = styled.img({
  margin: '0 0 0 0',
  width: '40%',
  height: 'auto',
  minWidth: '250px',
  '@media (max-width: 400px)': {
    width: '70%',
    minWidth: '220px'
  }
})

export { Img2 }
