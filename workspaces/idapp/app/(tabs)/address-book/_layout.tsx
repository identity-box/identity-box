import { Stack } from 'expo-router'

export default function AddressBookStack() {
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
          headerShown: false,
          presentation: 'modal'
        }}
      />
    </Stack>
  )
}
