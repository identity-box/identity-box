import { Stack } from 'expo-router'
import { AddressBook, AddIdentityButton } from '~/views/address-book'

export default function Identities() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <AddIdentityButton />
        }}
      />
      <AddressBook />
    </>
  )
}
