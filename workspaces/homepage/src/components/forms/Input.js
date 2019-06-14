import styled from '@emotion/styled'

const Input = styled.input({
  fontFamily: '"Roboto Mono", monospace',
  fontSize: '0.8rem',
  width: '100%',
  backgroundColor: 'black',
  color: 'white',
  borderRadius: '20px',
  border: '1px solid white',
  padding: '20px',
  resize: 'none',
  outlineWidth: 0,
  transition: 'border-color 0.2s ease-in-out 0s',
  ':focus': {
    borderColor: '#0099FF'
  },
  '::selection': {
    backgroundColor: 'white'
  }
})

export { Input }
