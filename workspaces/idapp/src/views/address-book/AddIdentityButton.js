import React from 'react'
import { TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const AddIdentityButton = ({ navigation }) => (
  <TouchableOpacity
    style={{
      aspectRatio: 1,
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}
    onPress={() => navigation.navigate('CreateNewIdentity')}
  >
    <MaterialCommunityIcons
      name='account-plus-outline'
      size={25}
      color='#FF6699'
    />
  </TouchableOpacity>
)

export { AddIdentityButton }
