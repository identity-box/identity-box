import '@emotion/react'
import type { Theme as ReactNavigationTheme } from '@react-navigation/native'

declare module '@emotion/react' {
  export interface Theme {
    colorScheme: 'light' | 'dark'
    theme: ReactNavigationTheme
  }
}
