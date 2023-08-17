import styled from '@emotion/native'

import { FlatList } from 'react-native'
import { useTheme } from '@emotion/react'

import { LogDb } from './LogDb'
import { LogItem } from './ui'

const ConsoleContainer = styled.View(({ theme: { theme } }) => ({
  borderColor: theme.dark ? 'white' : 'black',
  borderWidth: 1,
  width: '100%',
  flexBasis: 0,
  flexGrow: 1,
  marginTop: 20
}))

const Console = () => {
  const { theme } = useTheme()

  const getItemStyle = (index: number) => {
    let backgroundColor
    if (index % 2 === 0) {
      backgroundColor = theme.dark ? '#111' : '#eee'
    } else {
      backgroundColor = theme.dark ? '#333' : '#ccc'
    }
    return {
      backgroundColor
    }
  }

  return (
    <ConsoleContainer>
      <FlatList
        data={LogDb.lastN(50).map((i, index) => ({ key: index, value: i }))}
        renderItem={({ item, index }) => {
          return <LogItem style={getItemStyle(index)}>{item.value}</LogItem>
        }}
      />
    </ConsoleContainer>
  )
}

export { Console }
