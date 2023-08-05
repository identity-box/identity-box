import { useColorScheme } from 'react-native'
import { Slot } from 'expo-router'
import { ThemeProvider } from '@emotion/react'
import { Buffer } from 'buffer'
import { RecoilRoot } from 'recoil'

window.Buffer = Buffer

export default function HomeLayout() {
  const colorScheme = useColorScheme()

  console.log('colorScheme=', colorScheme)

  return (
    <RecoilRoot>
      <ThemeProvider
        theme={{
          colorScheme
        }}
      >
        <Slot />
      </ThemeProvider>
    </RecoilRoot>
  )
}
