import { View, Text, TouchableOpacity } from 'react-native'
import type { ColorValue } from 'react-native'
import styled from '@emotion/native'

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

type IdentityCellProps = {
  children?: React.ReactNode
  onSelect: (children?: React.ReactNode) => void
  size?: number
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify'
  backgroundColor?: ColorValue
}

const IdentityCell = ({
  children,
  onSelect,
  size = 16,
  textAlign = 'left',
  backgroundColor = 'transparent'
}: IdentityCellProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => {
        onSelect && onSelect(children)
      }}
    >
      <View
        style={{
          padding: 10,
          backgroundColor
        }}
      >
        <Text
          style={{
            fontSize: size,
            textAlign
          }}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

type HighlightedIdentityCellProps = {
  children?: React.ReactNode
  onSelect: (children?: React.ReactNode) => void
}

const HighlightedIdentityCell = ({
  children,
  onSelect
}: HighlightedIdentityCellProps) => {
  return (
    <TouchableHighlight
      underlayColor='#d3d3d3'
      onPress={() => {
        onSelect && onSelect(children)
      }}
    >
      <View>
        <Text>{children}</Text>
      </View>
    </TouchableHighlight>
  )
}

type EmptyIdentityCellProps = {
  children?: React.ReactNode
}

const EmptyIdentityCell = ({ children }: EmptyIdentityCellProps) => {
  return (
    <Container>
      <Text>{children}</Text>
    </Container>
  )
}

export { IdentityCell, EmptyIdentityCell, HighlightedIdentityCell }
