import { useTheme } from '@emotion/react'
import { Stack } from 'expo-router'
import { ThemeConstants } from '~/theme'

export default function AddressBookStack() {
  const { colorScheme, theme } = useTheme()
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Identities',
        headerStyle: {
          backgroundColor: theme.colors.background
        },
        headerTitleStyle: {
          color: theme.colors.text
        }
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
