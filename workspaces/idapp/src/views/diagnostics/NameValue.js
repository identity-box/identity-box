import styled from '@emotion/native'

const Container = styled.View(({ theme: { theme } }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  backgroundColor: theme.colors.background
}))

const Name = styled.Text({
  fontSize: 12,
  textAlign: 'left'
})

const Value = styled.Text({
  fontSize: 12,
  textAlign: 'left'
})

const NameValue = ({ name, value }) => {
  return (
    <Container>
      <Name>{name}</Name>
      <Value>{value}</Value>
    </Container>
  )
}

export { NameValue }
