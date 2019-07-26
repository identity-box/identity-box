import React from 'react'
import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation'

import { FirstIdentity, CurrentIdentity } from 'src/views/identity'
import { AppLoading } from './AppLoading'

const DefaultAppStack = createStackNavigator({ CurrentIdentity })
const FirstIdentityStack = createStackNavigator({ FirstIdentity })

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
