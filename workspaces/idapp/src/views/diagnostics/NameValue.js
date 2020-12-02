import React from 'react'
import styled from '@emotion/native'
import { Themed, ThemeColors } from 'react-navigation'

const Container = styled.View(({ theme: { colorScheme: theme } }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  backgroundColor: ThemeColors[theme].body
}))

const Name = styled(Themed.Text)({
  fontSize: 12,
  textAlign: 'left'
})

const Value = styled(Themed.Text)({
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
