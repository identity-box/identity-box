import React from 'react'
import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation'

import { FirstIdentity, CurrentIdentity } from 'src/views/identity'
import { AppLoading } from './AppLoading'

const DefaultAppStack = createStackNavigator({ CurrentIdentity }, { headerMode: 'none' })
const FirstIdentityStack = createStackNavigator({ FirstIdentity }, { headerMode: 'none' })

const AppContainer = createAppContainer(createSwitchNavigator({
  AppLoading,
  DefaultApp: DefaultAppStack,
  FirstIdentity: FirstIdentityStack
},
{
  initialRouteName: 'AppLoading'
}
))

const Main = () => {
  return (
    <AppContainer />
  )
}

export { Main }
