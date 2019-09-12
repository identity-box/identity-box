import React from 'react'
import { createSwitchNavigator, createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'

import { FirstIdentity, CurrentIdentity } from 'src/views/identity'
import { Settings, BackupMnemonic } from 'src/views/settings'
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
  defaultNavigationOptions: ({ navigation }) => ({
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
        backgroundColor: 'black'
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
  BackupMnemonic
},
{
  initialRouteName: 'AppLoading'
  // initialRouteName: 'DefaultApp'
}
))

const Main = () => {
  return (
    <AppContainer />
  )
}

export { Main }
