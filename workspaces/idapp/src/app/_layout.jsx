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
              headerShown: false
            }}
          >
            <Stack.Screen name='index' />
            <Stack.Screen
              name='first-identity'
              options={{
                animation: 'fade',
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name='(tabs)'
              options={{
                animation: 'fade',
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name='scan-idbox-modal'
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name='scan-idbox'
              options={{
                animation: 'fade',
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name='restore-from-backup'
              options={{
                animation: 'fade',
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name='app-loading'
              options={{
                animation: 'fade',
                presentation: 'card'
              }}
            />
          </Stack>
        </ThemeProviderEmotion>
      </ThemeProvider>
    </RecoilRoot>
  )
}
