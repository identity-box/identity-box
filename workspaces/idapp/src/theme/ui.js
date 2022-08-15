import { TouchableOpacity, Text } from 'react-native'
import { useTheme } from 'react-navigation'

import { ThemeConstants } from './ThemeConstants'

const ThemedButton = ({ title, disabled, ...props }) => {
  const theme = useTheme()
  return (
    <TouchableOpacity {...props} disabled={disabled}>
      <Text style={{
        padding: 8,
        textAlign: 'center',
        fontSize: 18,
        color: disabled ? ThemeConstants[theme].disabledColor : ThemeConstants[theme].accentColor
      }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export { ThemedButton }
