import { TouchableOpacity, Text } from 'react-native'
import type { TouchableOpacityProps } from 'react-native'
import { useTheme } from '@emotion/react'

import { ThemeConstants } from './ThemeConstants'

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string
  disabled: boolean
}

const ThemedButton = ({ title, disabled, ...props }: ThemedButtonProps) => {
  const { colorScheme: theme } = useTheme()

  return (
    <TouchableOpacity {...props} disabled={disabled}>
      <Text
        style={{
          padding: 8,
          textAlign: 'center',
          fontSize: 18,
          color: disabled
            ? ThemeConstants[theme].disabledColor
            : ThemeConstants[theme].accentColor
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export { ThemedButton }
