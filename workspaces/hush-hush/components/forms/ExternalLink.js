import styled from '@emotion/styled'

const ExternalLink = styled.a(props => ({
  fontFamily: '"Roboto Mono", monospace',
  fontSize: '0.8em',
  backgroundColor: 'transparent',
  color: props.disabled ? 'grey' : 'white',
  marginTop: '20px',
  borderRadius: '10px',
  borderColor: 'white',
  opacity: '1.0',
  padding: '15px',
  border: '1px solid white',
  transition: 'all 0.2s ease-in-out 0s',
  '&:hover': {
    filter: props.disabled ? 'none' : 'brightness(85%)',
    textDecoration: 'none',
    border: '1px solid #D20DE7',
    color: '#D20DE7'
  }
}))

export { ExternalLink }
