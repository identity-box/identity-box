import React from 'react'
import { Appearance, useColorScheme } from 'react-native-appearance'
import { createSwitchNavigator, createAppContainer, ThemeColors } from 'react-navigation'
import { ThemeProvider } from 'emotion-theming'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'

import { FirstIdentity, CurrentIdentity } from 'src/views/identity'
import { Settings, BackupMnemonic, ConfirmFactoryReset, RestoreFromBackup, BackupNotFound } from 'src/views/settings'
import { AddressBook, IdentityDetails, AddNewIdentity, SelectIdentity } from 'src/views/address-book'
import { AppLoading } from './AppLoading'
import { ScanIdBoxTelepath } from './ScanIdBoxTelepath'
import { FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons'

// const DefaultAppStack = createStackNavigator({ CurrentIdentity }, { headerMode: 'none' })
const AddressBookStack = createStackNavigator({
  AddressBook,
  IdentityDetails
}, {
  defaultNavigationOptions: {
    headerTintColor: '#FF6699'
  }
})

AddressBookStack.navigationOptions = {
  tabBarLabel: 'Address Book'
}

const SettingsStack = createStackNavigator({
  Settings
}, {
  defaultNavigationOptions: {
    headerTintColor: '#FF6699'
  },
  headerMode: 'none'
})

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings'
}

const MainAppStack = createBottomTabNavigator({
  CurrentIdentity,
  AddressBookStack,
  SettingsStack
}, {
  // initialRouteName: 'AddressBookStack',
  defaultNavigationOptions: ({ navigation, theme }) => ({
    tabBarIcon: ({ focused, horizontal, tintColor }) => {
      const { routeName } = navigation.state
      let iconName
      if (routeName === 'CurrentIdentity') {
        iconName = 'perm-identity'
        return <MaterialIcons name={iconName} size={25} color={tintColor} />
      } else if (routeName === 'AddressBookStack') {
        iconName = 'address-book-o'
        return <FontAwesome name={iconName} size={25} color={tintColor} />
      } else if (routeName === 'SettingsStack') {
        iconName = 'settings'
        return <Feather name={iconName} size={25} color={tintColor} />
      }
    },
    tabBarOptions: {
      activeTintColor: '#FF6699',
      inactiveTintColor: 'gray',
      style: {
        backgroundColor: theme === 'light' ? 'black' : ThemeColors.dark.header
      }
    }
  })
})

const DefaultAppStack = createStackNavigator({
  MainAppStack,
  AddNewIdentity,
  SelectIdentity
}, {
  headerMode: 'none',
  mode: 'modal'
})

const FirstIdentityStack = createStackNavigator({ FirstIdentity }, { headerMode: 'none' })

const AppContainer = createAppContainer(createSwitchNavigator({
  AppLoading,
  ScanIdBoxTelepath,
  DefaultApp: DefaultAppStack,
  FirstIdentity: FirstIdentityStack,
  BackupMnemonic,
  ConfirmFactoryReset,
  RestoreFromBackup,
  BackupNotFound
},
{
  // initialRouteName: 'BackupNotFound'
  initialRouteName: 'AppLoading'
  // initialRouteName: 'RestoreFromBackup'
}
))

Appearance.getColorScheme()

Appearance.addChangeListener(({ colorScheme }) => {
  console.log('current color scheme:', colorScheme)
})

const Main = () => {
  const colorScheme = useColorScheme()
  console.log('theme=', colorScheme)
  return (
    <ThemeProvider theme={{
      colorScheme
    }}
    >
      <AppContainer theme={colorScheme} />
    </ThemeProvider>
  )
}

export { Main }
