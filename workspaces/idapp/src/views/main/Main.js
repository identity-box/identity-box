import { StatusBar, useColorScheme } from 'react-native'
import {
  createSwitchNavigator,
  createAppContainer,
  ThemeColors
} from 'react-navigation'
import { ThemeProvider } from '@emotion/react'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'

import {
  FirstIdentity,
  CurrentIdentity,
  CreateNewIdentity
} from '~/views/identity'
import {
  Settings,
  BackupMnemonic,
  ConfirmFactoryReset,
  RestoreFromBackup,
  BackupNotFound
} from '~/views/settings'
import { Diagnostics } from '~/views/diagnostics'
import {
  AddressBook,
  IdentityDetails,
  AddNewIdentity,
  SelectIdentity,
  SwitchIdentity
} from '~/views/address-book'
import { IdBoxKeyNaming } from '~/views/migrations'
import { AppLoading } from './AppLoading'
import { ScanIdBox } from './ScanIdBox'
import { FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons'

// const DefaultAppStack = createStackNavigator({ CurrentIdentity }, { headerMode: 'none' })
const CurrentIdentityStack = createStackNavigator(
  {
    CurrentIdentity,
    SwitchIdentity
  },
  {
    headerMode: 'none',
    mode: 'modal'
  }
)

CurrentIdentityStack.navigationOptions = {
  tabBarLabel: 'Identity'
}

const AddressBookStack = createStackNavigator(
  {
    AddressBook,
    IdentityDetails,
    CreateNewIdentity
  },
  {
    defaultNavigationOptions: {
      headerTintColor: '#FF6699'
    }
  }
)

AddressBookStack.navigationOptions = {
  tabBarLabel: 'Address Book'
}

const SettingsStack = createStackNavigator(
  {
    Settings
  },
  {
    defaultNavigationOptions: {
      headerTintColor: '#FF6699'
    },
    headerMode: 'none'
  }
)

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings'
}

const MainAppStack = createBottomTabNavigator(
  {
    CurrentIdentityStack,
    AddressBookStack,
    SettingsStack
  },
  {
    // initialRouteName: 'AddressBookStack',
    defaultNavigationOptions: ({ navigation, theme }) => ({
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = navigation.state
        let iconName
        if (routeName === 'CurrentIdentityStack') {
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
  }
)

const DefaultAppStack = createStackNavigator(
  {
    MainAppStack,
    AddNewIdentity,
    SelectIdentity
  },
  {
    // initialRouteName: 'SelectIdentity',
    headerMode: 'none',
    mode: 'modal'
  }
)

const FirstIdentityStack = createStackNavigator(
  { FirstIdentity },
  { headerMode: 'none' }
)

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      AppLoading,
      ScanIdBox,
      DefaultApp: DefaultAppStack,
      FirstIdentity: FirstIdentityStack,
      BackupMnemonic,
      ConfirmFactoryReset,
      RestoreFromBackup,
      BackupNotFound,
      IdBoxKeyNaming,
      Diagnostics
    },
    {
      // initialRouteName: 'BackupNotFound'
      // initialRouteName: 'BackupMnemonic'
      // initialRouteName: 'CreateNewIdentity'
      initialRouteName: 'ConfirmFactoryReset'
      // initialRouteName: 'AppLoading'
      // initialRouteName: 'DefaultApp'
      // initialRouteName: 'RestoreFromBackup'
    }
  )
)

const Main = () => {
  const colorScheme = useColorScheme()

  console.log('colorScheme=', colorScheme)

  return (
    <ThemeProvider
      theme={{
        colorScheme
      }}
    >
      <StatusBar barStyle='default' />
      <AppContainer theme={colorScheme} />
    </ThemeProvider>
  )
}

export { Main }
