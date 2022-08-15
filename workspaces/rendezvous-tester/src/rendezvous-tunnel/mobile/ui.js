import styled from '@emotion/styled'

export const Message = ({ msg, placeholder }) => {
  if (msg === placeholder) {
    return (
      <p style={{ border: '1px solid black', maxWidth: '300px', padding: '20px', fontSize: '24px', fontWeight: 'normal', color: '#777' }}>{placeholder}</p>
    )
  } else {
    return (
      <p style={{ border: '1px solid black', maxWidth: '300px', padding: '20px', fontSize: '24px', fontWeight: 'bold' }}>{msg}</p>
    )
  }
}

export const Input = styled.input({
  flex: '1 0 0',
  fontSize: '1.0em',
  height: '1.4em',
  padding: '5px',
  marginLeft: '10px'
})

export const Label = styled.label({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: '30px',
  padding: '5px 0',
  flex: '5 0 0'
})
