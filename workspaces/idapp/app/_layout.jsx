import { useColorScheme } from 'react-native'
import { Slot } from 'expo-router'
import { ThemeProvider as ThemeProviderEmotion } from '@emotion/react'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native'
import { Buffer } from 'buffer'
import { RecoilRoot } from 'recoil'

window.Buffer = Buffer

export default function HomeLayout() {
  const colorScheme = useColorScheme()

  console.log('colorScheme=', colorScheme)

  return (
    <RecoilRoot>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ThemeProviderEmotion
          theme={{
            colorScheme,
            theme: colorScheme === 'dark' ? DarkTheme : DefaultTheme
          }}
        >
          <Slot />
        </ThemeProviderEmotion>
      </ThemeProvider>
    </RecoilRoot>
  )
}
