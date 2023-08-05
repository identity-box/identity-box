import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from 'react-native'

import { MultiRendezvousConfiguration } from '../../rendezvous'
import { Console } from './Console'

import { NameValue } from './NameValue'
import { PageContainer, Container } from './ui'

const Diagnostics = ({ navigation }) => {
  const [values, setValues] = useState({})
  const rendezvousConfiguration = useRef(undefined)

  const onExit = navigation.getParam('onExit', undefined)

  const exitDiagnostics = useCallback(() => {
    onExit && onExit()
  }, [])

  const valueToString = (name) => {
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
    const values = {}
    rendezvousConfiguration.current =
      await MultiRendezvousConfiguration.instance('idbox')
    const { url } = await rendezvousConfiguration.current.get()
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
