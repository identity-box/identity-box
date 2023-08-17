import styled from '@emotion/native'
import { ThemeConstants } from '~/theme'

const Container = styled.View(({ theme: { colorScheme } }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  backgroundColor: ThemeConstants[colorScheme].backgroundColor
}))

const Name = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].textColor,
  fontSize: 12,
  textAlign: 'left'
}))

const Value = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].textColor,
  fontSize: 12,
  textAlign: 'left'
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
