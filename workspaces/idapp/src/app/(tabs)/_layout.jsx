import { useTheme } from '@emotion/react'
import { DarkTheme } from '@react-navigation/native'
import { Tabs } from 'expo-router'
import { FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons'

export default function MainLayout() {
  const { colorScheme } = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6699',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor:
            colorScheme === 'light' ? 'black' : DarkTheme.colors.background
        }
      }}
    >
      <Tabs.Screen
        name='identity'
        options={{
          title: 'Identity',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name='perm-identity' size={25} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name='address-book'
        options={{
          title: 'Address Book',
          tabBarIcon: ({ color }) => (
            <FontAwesome name='address-book-o' size={25} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Feather name='settings' size={25} color={color} />
          )
        }}
      />
    </Tabs>
  )
}
