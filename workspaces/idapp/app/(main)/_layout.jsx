import { Tabs } from 'expo-router'

export default function MainLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name='index'
        options={{
          headerShown: false,
          title: 'Tab One'
        }}
      />
      <Tabs.Screen
        name='two'
        options={{
          headerShown: false,
          title: 'Tab Two'
        }}
      />
    </Tabs>
  )
}
