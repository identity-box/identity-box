import styled from '@emotion/styled'

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

export { TextBox }
