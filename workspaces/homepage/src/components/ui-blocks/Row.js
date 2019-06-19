import styled from '@emotion/styled'

const Row = styled.div({
  width: '90%',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-around',
  '@media (max-width: 1100px)': {
    flexFlow: 'column',
    justifyContent: 'center',
    textAlign: 'center'
  },
  alignItems: 'center',
  marginBottom: '30px'
})

export { Row }
