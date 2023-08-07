import { useCallback } from 'react'
import { Button } from 'react-native'
import { router } from 'expo-router'

import { Wrapper, Header, Description } from './ui'

const FactoryReset = () => {
  const onFactoryReset = useCallback(() => {
    // navigation.navigate('ConfirmFactoryReset')
    router.push('/settings/confirm-factory-reset')
  }, [])

  return (
    <Wrapper>
      <Header>Factory Reset</Header>
      <Description>
        Performing factory reset will erase all your identities, private keys,
        and will also clear your personal data on the identity box.
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
