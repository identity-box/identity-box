import { useColorScheme } from 'react-native'
import { Stack } from 'expo-router'
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
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade'
            }}
          >
            <Stack.Screen name='index' />
            <Stack.Screen
              name='scan-idbox'
              options={{
                animation: 'slide_from_bottom',
                presentation: 'fullScreenModal'
              }}
            />
            <Stack.Screen
              name='first-identity'
              options={{
                animation: 'fade',
                presentation: 'fullScreenModal'
              }}
            />
            <Stack.Screen
              name='restore-from-backup'
              options={{
                animation: 'fade',
                presentation: 'modal'
              }}
            />
          </Stack>
        </ThemeProviderEmotion>
      </ThemeProvider>
    </RecoilRoot>
  )
}
