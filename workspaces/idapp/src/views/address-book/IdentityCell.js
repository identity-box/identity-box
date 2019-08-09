import React from 'react'
import { Text, View } from 'react-native'
import styled from '@emotion/native'

const Touchable = styled.TouchableOpacity({
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 10
})

const Container = styled.View({
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 10
})

const IdentityCell = ({ children, onSelect }) => {
  return (
    <Touchable
      activeOpacity={0.6}
      onPress={_ => {
        onSelect && onSelect(children)
      }}
    >
      <View>
        <Text>{children}</Text>
      </View>
    </Touchable>
  )
}

const EmptyIdentityCell = ({ children }) => {
  return (
    <Container>
      <Text>{children}</Text>
    </Container>
  )
}

export { IdentityCell, EmptyIdentityCell }
