import styled from '@emotion/styled'

export const Wrapper = styled.div({
  display: 'flex',
  margin: '0 auto',
  boxSizing: 'border-box',
  flexFlow: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  padding: '30px',
  minWidth: '750px',
  maxWidth: '750px',
  overflow: 'auto',
  height: '100vh'
})

export const Row = styled.div({
  display: 'flex',
  width: '100%'
})

export const ButtonLink = styled.button({
  display: 'block',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
  margin: '20px 0',
  padding: 0
})

export const Input = styled.input({
  height: '1.8em',
  padding: '5px',
  flex: '5 0 0'
})

export const Button = styled.button({
  height: '2.8em',
  marginLeft: '20px',
  flex: '1 0 0'
})
