import { useState, useEffect, useCallback } from 'react'
import { Button } from 'react-native'
import { router } from 'expo-router'

import { MultiRendezvousConfiguration } from '../../rendezvous'
import { Console } from './Console'

import { NameValue } from './NameValue'
import { PageContainer, Container } from './ui'

const Diagnostics = ({ error }: { error?: Error }) => {
  const [values, setValues] = useState<
    Record<string, string | null | undefined>
  >({})

  const exitDiagnostics = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.push('/app-loading')
    }
  }, [])

  const valueToString = (name: string) => {
    const value = values[name]
    if (value === undefined) {
      return 'undefined'
    } else if (value === null) {
      return 'null'
    } else {
      return value
    }
  }

  const readValues = async () => {
    const values: Record<string, string | null | undefined> = {}
    const rendezvousConfiguration = await MultiRendezvousConfiguration.instance(
      'idbox'
    )
    const { url } = await rendezvousConfiguration.get()
    values.rendezvousUrl = url

    const { url: directUrl } = await MultiRendezvousConfiguration.recall(
      'idbox'
    )
    values.rendezvousUrlDirect = directUrl

    setValues(values)
  }

  useEffect(() => {
    readValues()
  }, [])

  return (
    <PageContainer>
      <Container>
        {error ? (
          <NameValue name='Error' value={error?.message || 'undefined'} />
        ) : null}
        <NameValue
          name='rendezvousUrl'
          value={valueToString('rendezvousUrl')}
        />
        <NameValue
          name='rendezvousUrl[direct]'
          value={valueToString('rendezvousUrlDirect')}
        />
        <Console />
      </Container>
      <Button
        title='Exit diagnostics'
        color='#FF6699'
        accessibilityLabel='Exit diagnostics'
        onPress={exitDiagnostics}
      />
    </PageContainer>
  )
}

export { Diagnostics }
