import { useTheme } from '@emotion/react'
import { Stack } from 'expo-router'
import { ThemeConstants } from '~/theme'

export default function AddressBookStack() {
  const { colorScheme } = useTheme()
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Identities'
      }}
    >
      <Stack.Screen name='identities' />
      <Stack.Screen
        name='identity-details'
        options={{
          headerTintColor: ThemeConstants[colorScheme].accentColor,
          headerTitle: '',
          presentation: 'card'
        }}
      />
      <Stack.Screen
        name='create-new-identity'
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom'
        }}
      />
    </Stack>
  )
}
