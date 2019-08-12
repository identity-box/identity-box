import React, { useState, useCallback } from 'react'
import { Button } from 'react-native'
import styled from '@emotion/native'
import QRCode from 'react-native-qrcode-svg'

import { useIdentity } from 'src/identity'

const Container = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
})

const SubContainer = styled.View({
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80%',
  height: '80%'
})

const Description = styled.Text({
  fontSize: 12,
  color: '#aaaaaa',
  textAlign: 'center'
})

const IdentityName = styled.TextInput({
  fontSize: 24,
  fontWeight: 'bold',
  marginTop: 30,
  marginBottom: 30,
  width: '100%',
  textAlign: 'center'
})

const DID = styled.Text({
  fontSize: 12,
  marginTop: 20,
  width: 150,
  flexGrow: 1,
  textAlign: 'center'
})

const Row = styled.View({
  flex: 1,
  flexDirection: 'row',
  width: '70%',
  justifyContent: 'space-between',
  alignItems: 'center'
})

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
