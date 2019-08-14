import React, { useState, useCallback } from 'react'
import { Button } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { useIdentity } from 'src/identity'
import { Container,
  SubContainer,
  Description,
  IdentityName,
  DID,
  Row
} from './ui'

const AddNewIdentity = ({ navigation }) => {
  const [name, setName] = useState('')
  const [placeholderText, setPlaceholderText] = useState('name')

  const did = navigation.getParam('did', '')

  const { addPeerIdentity } = useIdentity({
    onPeerIdentitiesChanged: () => {
      navigation.navigate('CurrentIdentity')
    }
  })

  const addIdentity = useCallback(() => {
    console.log('add identity')
    addPeerIdentity({ name, did })
  }, [name, did])

  const cancel = useCallback(() => {
    console.log('cancel')
    navigation.navigate('CurrentIdentity')
  }, [])

  return (
    <Container>
      <SubContainer>
        <Description>Give your new peer identity a descriptive name</Description>
        <IdentityName
          placeholder={placeholderText}
          onFocus={() => setPlaceholderText('')}
          onBlur={() => setPlaceholderText('name')}
          onChangeText={setName}
          value={name}
        />
        <QRCode
          value={did}
          size={150}
        />
        <DID>{did}</DID>
        <Row>
          <Button
            title='Add'
            color='#FF6699'
            disabled={!name}
            accessibilityLabel='add identity'
            onPress={addIdentity}
          />
          <Button
            title='Cancel'
            color='black'
            accessibilityLabel='cancel adding identity'
            onPress={cancel}
          />
        </Row>
      </SubContainer>
    </Container>
  )
}

export { AddNewIdentity }
