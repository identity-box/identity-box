import { useState, useCallback, useRef } from 'react'
import { useTheme } from '@emotion/react'
import Constants from 'expo-constants'
import styled from '@emotion/native'

import { IdentityManager, useIdentity } from '~/identity'
import { ListWithHeader, MrSpacer } from '~/ui'
import { router } from 'expo-router'

const Container = styled.View({
  flex: 1
})

const SwitchIdentity = () => {
  const identityManager = useRef<IdentityManager>()
  const [identityNames, setIdentityNames] = useState<Array<string>>([])
  const { colorScheme } = useTheme()

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
    setIdentityNames(idManager.identityNames)
  }, [])

  useIdentity({
    onReady: onIdentityManagerReady
  })

  const onSelect = useCallback(async (identityName: React.ReactNode) => {
    await identityManager.current?.setCurrent(identityName as string)
    router.back()
  }, [])

  return (
    <Container
      style={{
        backgroundColor: colorScheme === 'light' ? 'white' : '#111'
      }}
    >
      <MrSpacer space={20 + Constants.statusBarHeight} />
      <ListWithHeader
        data={identityNames}
        headerText='Switch Identity'
        onSelect={onSelect}
        width='90%'
      />
      <MrSpacer space={20} />
    </Container>
  )
}

export { SwitchIdentity }
