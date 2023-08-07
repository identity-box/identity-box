import styled from '@emotion/native'

const Container = styled.View(({ theme: { theme } }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  backgroundColor: theme.colors.background
}))

const Name = styled.Text(({ theme: { theme } }) => ({
  fontSize: 12,
  textAlign: 'left',
  color: theme.colors.text
}))

const Value = styled.Text(({ theme: { theme } }) => ({
  fontSize: 12,
  textAlign: 'left',
  color: theme.colors.text
}))

type NameValueProps = {
  name: string
  value: string
}

const NameValue = ({ name, value }: NameValueProps) => {
  return (
    <Container>
      <Name>{name}</Name>
      <Value>{value}</Value>
    </Container>
  )
}

export { NameValue }
