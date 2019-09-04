import React, { useCallback } from 'react'
import styled from '@emotion/native'
import QRCode from 'react-native-qrcode-svg'
import { Button } from 'react-native'

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

const IdentityName = styled.Text({
  fontSize: 32,
  fontWeight: 'bold',
  marginBottom: 20
})

const Separator = styled.View(({ size }) => ({
  width: 1,
  height: size
}))

const Did = styled.Text({
  fontSize: 12,
  marginBottom: 20,
  flexGrow: 1,
  textAlign: 'center'
})

const IdentityDetails = ({ navigation }) => {
  const name = navigation.getParam('name', '')
  const did = navigation.getParam('did', '')
  const isOwn = navigation.getParam('isOwn', false)

  const { deletePeerIdentity } = useIdentity({
    onPeerIdentitiesChanged: () => {
      navigation.navigate('AddressBook')
    }
  })

  const deleteIdentity = useCallback(() => {
    console.log(`deleting peer identity with name: ${name}`)
    deletePeerIdentity({ name })
  }, [])

  return (
    <Container>
      <SubContainer>
        <IdentityName>{name}</IdentityName>
        <Did>{did}</Did>
        <QRCode
          value={did}
          size={150}
        />
        {!isOwn &&
          <>
            <Separator size={50} />
            <Button
              title='Delete this identity'
              color='red'
              accessibilityLabel='delete identity'
              onPress={deleteIdentity}
            />
          </>}
      </SubContainer>
    </Container>
  )
}

export { IdentityDetails }
