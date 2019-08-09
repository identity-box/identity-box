import React from 'react'
import { createSwitchNavigator, createStackNavigator, createAppContainer, createBottomTabNavigator } from 'react-navigation'

import { FirstIdentity, CurrentIdentity } from 'src/views/identity'
import { AddressBook, IdentityDetails } from 'src/views/address-book'
import { AppLoading } from './AppLoading'
import { ScanIdBoxTelepath } from './ScanIdBoxTelepath'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'

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

const DefaultAppStack = createBottomTabNavigator({
  CurrentIdentity,
  AddressBookStack
}, {
  // initialRouteName: 'AddressBookStack',
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused, horizontal, tintColor }) => {
      const { routeName } = navigation.state
      let iconName
      if (routeName === 'CurrentIdentity') {
        iconName = `perm-identity`
        return <MaterialIcons name={iconName} size={25} color={tintColor} />
      } else if (routeName === 'AddressBookStack') {
        iconName = `address-book-o`
        return <FontAwesome name={iconName} size={25} color={tintColor} />
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

const FirstIdentityStack = createStackNavigator({ FirstIdentity }, { headerMode: 'none' })

const AppContainer = createAppContainer(createSwitchNavigator({
  AppLoading,
  ScanIdBoxTelepath,
  DefaultApp: DefaultAppStack,
  FirstIdentity: FirstIdentityStack
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
