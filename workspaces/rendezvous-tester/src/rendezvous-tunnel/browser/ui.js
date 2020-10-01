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

export const TunnelId = styled.p({
  margin: 0,
  border: '1px solid black',
  padding: '10px',
  fontSize: '24px',
  fontWeight: 'bold'
})

export const Response = styled.p({
  border: '1px solid black',
  maxWidth: '300px',
  padding: '20px',
  fontSize: '24px',
  fontWeight: 'bold'
})
