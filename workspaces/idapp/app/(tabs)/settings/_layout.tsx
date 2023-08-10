import { Stack } from 'expo-router'

export default function SettingsStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name='index' />
      <Stack.Screen
        name='backup-mnemonic'
        options={{
          headerShown: false,
          animation: 'fade',
          presentation: 'fullScreenModal'
        }}
      />
      <Stack.Screen
        name='confirm-factory-reset'
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name='diagnostics'
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
          presentation: 'modal'
        }}
      />
    </Stack>
  )
}
