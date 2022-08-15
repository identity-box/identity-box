import { useCallback } from 'react'
import { Button } from 'react-native'

import { Wrapper, Header, Description } from './ui'

const FactoryReset = ({ navigation }) => {
  const onFactoryReset = useCallback(() => {
    navigation.navigate('ConfirmFactoryReset')
  }, [])

  return (
    <Wrapper>
      <Header>Factory Reset</Header>
      <Description>
        Performing factory reset will erase all your identities, private keys, and will also clear your personal data on the identity box.
      </Description>
      <Button
        color='red'
        onPress={onFactoryReset}
        title='Reset...'
        accessibilityLabel='Perform factory reset...'
      />
    </Wrapper>
  )
}

export { FactoryReset }
