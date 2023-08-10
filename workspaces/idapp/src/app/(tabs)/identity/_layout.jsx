import { Stack } from 'expo-router'

export default function CurrentIdentityStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name='current-identity' />
      <Stack.Screen
        name='select-identity'
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name='add-new-identity'
        options={{
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal'
        }}
      />
    </Stack>
  )
}
