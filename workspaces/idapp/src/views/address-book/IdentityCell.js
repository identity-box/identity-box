import React from 'react'
import { View } from 'react-native'
import { Themed } from 'react-navigation'
import styled from '@emotion/native'

const Touchable = styled.TouchableOpacity({
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 10,
  paddingRight: 10
})

const TouchableHighlight = styled.TouchableHighlight({
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
        <Themed.Text>{children}</Themed.Text>
      </View>
    </Touchable>
  )
}

const HighlightedIdentityCell = ({ children, onSelect }) => {
  return (
    <TouchableHighlight
      underlayColor='#d3d3d3'
      onPress={_ => {
        onSelect && onSelect(children)
      }}
    >
      <View>
        <Themed.Text>{children}</Themed.Text>
      </View>
    </TouchableHighlight>
  )
}

const EmptyIdentityCell = ({ children }) => {
  return (
    <Container>
      <Themed.Text>{children}</Themed.Text>
    </Container>
  )
}

export { IdentityCell, EmptyIdentityCell, HighlightedIdentityCell }
