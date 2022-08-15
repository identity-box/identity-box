import { View } from 'react-native'
import { TapGestureHandler, State } from 'react-native-gesture-handler'

const DiagnosticsSensor = ({ navigation, onExit }) => {
  return (
    <View style={{
      flexGrow: 1,
      width: '100%',
      height: 0
    }}
    >
      <TapGestureHandler
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            navigation.navigate('Diagnostics', { onExit })
          }
        }}
        numberOfTaps={5}
      >
        <View style={{
          width: '100%',
          height: '100%'
        }}
        />
      </TapGestureHandler>
    </View>

  )
}

export { DiagnosticsSensor }
