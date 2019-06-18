import styled from '@emotion/styled'

const Box = styled.div({
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  backgroundImage: 'linear-gradient(#0C3C52, #5182BD)',
  padding: '50px',
  width: '100%',
  fontSize: '12pt',
  '@media (max-width: 568px)': {
    padding: '10px',
    fontSize: '10pt'
  }
}, ({ backgroundStyles }) => (
  { ...backgroundStyles }
))

export { Box }
