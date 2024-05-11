import { View } from 'react-native'
import { router } from 'expo-router'
import {
  GestureHandlerRootView,
  TapGestureHandler,
  State
} from 'react-native-gesture-handler'

const DiagnosticsSensor = () => {
  return (
    <View
      style={{
        flexGrow: 1,
        width: '100%',
        height: 0
      }}
    >
      <GestureHandlerRootView>
        <TapGestureHandler
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              router.push('/settings/diagnostics')
            }
          }}
          numberOfTaps={5}
        >
          <View
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </TapGestureHandler>
      </GestureHandlerRootView>
    </View>
  )
}

export { DiagnosticsSensor }
