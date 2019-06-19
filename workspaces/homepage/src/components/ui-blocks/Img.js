import styled from '@emotion/styled'

const Img = styled.img({
  margin: '0 0 0 0',
  width: '25%',
  height: 'auto',
  minWidth: '170px',
  '@media (max-width: 400px)': {
    width: '50%',
    minWidth: '150px'
  }
})

export { Img }
