import styled from '@emotion/styled'

const Button = styled.input(props => ({
  fontFamily: '"Roboto Mono", monospace',
  fontSize: '1.2em',
  backgroundColor: '#0099FF',
  color: props.disabled ? 'grey' : 'white',
  alignSelf: 'center',
  marginTop: '20px',
  borderRadius: '10px',
  outline: 0,
  width: '150px',
  height: '50px',
  border: 'none',
  opacity: '1.0',
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out 0s',
  ':active': {
    opacity: '0.6'
  },
  ':hover': {
    filter: props.disabled ? 'none' : 'brightness(85%)'
  },
  ':focus': {
    opacity: '0.8'
  },
  ':disabled': {
    backgroundColor: 'black',
    border: '1px solid grey'
  }
}))

export { Button }
