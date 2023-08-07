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
          presentation: 'modal'
        }}
      />
    </Stack>
  )
}
