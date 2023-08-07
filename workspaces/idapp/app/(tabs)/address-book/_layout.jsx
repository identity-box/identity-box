import { Stack } from 'expo-router'

export default function AddressBookStack() {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Identities'
      }}
    >
      <Stack.Screen name='identities' />
    </Stack>
  )
}
