import { useState, useCallback, useRef } from 'react'
import {
  Button,
  ActivityIndicator,
  DimensionValue,
  TouchableOpacity,
  Text,
  View
} from 'react-native'
import type { TouchableOpacityProps } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useErrorBoundary } from 'react-error-boundary'
import * as SecureStore from 'expo-secure-store'
import styled from '@emotion/native'

import { IdentityManager, useIdentity } from '~/identity'
import { useRendezvous } from '~/rendezvous'

import { QRCodeThemed, Description } from './ui'
import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'
import { BoxServices } from '~/box-services'
import { LogDb } from '~/views/diagnostics'
import { ThemeConstants } from '~/theme'
import { useTheme } from '@emotion/react'
import { initiateBackup } from '~/crypto'

const Container = styled.View(({ theme: { colorScheme } }) => ({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: ThemeConstants[colorScheme].backgroundColor
}))

const SubContainer = styled.View({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '90%',
  height: '80%'
})

const IdentityName = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].textColor,
  fontSize: 32,
  fontWeight: 'bold',
  marginBottom: 20
}))

const Separator = styled.View(({ size }: { size: DimensionValue }) => ({
  width: 1,
  height: size
}))

const Did = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].textColor,
  fontSize: 12,
  marginBottom: 50,
  textAlign: 'center',
  flexGrow: 1
}))

interface BackButtonProps extends TouchableOpacityProps {
  title: string
  disabled: boolean
}

const BackButton = ({ title, disabled, ...props }: BackButtonProps) => {
  const { colorScheme } = useTheme()

  return (
    <TouchableOpacity {...props} disabled={disabled}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <Ionicons
          name='ios-chevron-back'
          size={24}
          color={
            disabled
              ? ThemeConstants[colorScheme].disabledColor
              : ThemeConstants[colorScheme].accentColor
          }
        />
        <Text
          style={{
            textAlign: 'left',
            fontSize: 18,
            color: disabled
              ? ThemeConstants[colorScheme].disabledColor
              : ThemeConstants[colorScheme].accentColor
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const IdentityDetails = () => {
  const { showBoundary } = useErrorBoundary()
  const identityManager = useRef<IdentityManager>()
  const boxServices = useRef<BoxServices>()
  const {
    name = '',
    keyName = '',
    did = '',
    isOwnString = 'false'
  } = useLocalSearchParams<{
    name: string
    keyName: string
    did: string
    isOwnString: string
  }>()
  const isOwn = isOwnString === 'true'
  const [inProgress, setInProgress] = useState(false)
  const [identityManagerReady, setIdentityManagerReady] = useState(false)

  const doBackup = useCallback(async () => {
    try {
      if (!boxServices.current) {
        LogDb.log('IdentityDetails#doBackup: boxServices.current is undefined!')
        throw new Error('FATAL: No Connection to Identity Box device!')
      }
      if (!identityManager.current) {
        LogDb.log(
          'IdentityDetails#doBackup: identityManager.current is undefined!'
        )
        throw new Error('FATAL: Cannot Access Identities!')
      }
      if (
        !(await initiateBackup(boxServices.current, identityManager.current))
      ) {
        router.back()
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [showBoundary])

  const onIdentityManagerReady = useCallback((idManager: IdentityManager) => {
    identityManager.current = idManager
    setIdentityManagerReady(true)
  }, [])

  const onPeerIdentitiesChanged = useCallback(() => {
    console.log('IdentityDetails: onPeerIdentitiesChanged')
    doBackup()
  }, [doBackup])

  const onOwnIdentitiesChanged = useCallback(() => {
    console.log('IdentityDetails: onOwnIdentitiesChanged')
    doBackup()
  }, [doBackup])

  const { deletePeerIdentity, deleteOwnIdentity } = useIdentity({
    name: 'IdentityDetails',
    onReady: onIdentityManagerReady,
    onPeerIdentitiesChanged,
    onOwnIdentitiesChanged
  })

  const deleteIdentity = useCallback(() => {
    try {
      console.log(
        `deleting ${isOwn ? 'own' : 'peer'} identity with name: ${name}`
      )
      if (!boxServices.current) {
        LogDb.log('IdentityDetails#doBackup: boxServices.current is undefined!')
        throw new Error('FATAL: No Connection to Identity Box device!')
      }
      setInProgress(true)
      if (isOwn) {
        boxServices.current.deleteIdentityOnIdBox(keyName)
      } else {
        deletePeerIdentity({ name })
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        showBoundary(e)
      } else {
        showBoundary(new Error('unknown error!'))
      }
    }
  }, [name, keyName, isOwn, deletePeerIdentity, showBoundary])

  const onRendezvousReady = useCallback((rc: RendezvousClientConnection) => {
    boxServices.current = BoxServices.withConnection(rc)
  }, [])

  const onRendezvousMessage = useCallback(
    (message: RendezvousMessage) => {
      console.log(
        'received message: ',
        JSON.stringify(message, undefined, '  ')
      )
      if (message.method === 'backup-response') {
        router.back()
      } else if (message.method === 'delete-response') {
        deleteOwnIdentity({ name })
      }
    },
    [name, deleteOwnIdentity]
  )

  const onRendezvousError = useCallback(async (error: Error) => {
    console.log('error: ', error)
    await SecureStore.deleteItemAsync('backupEnabled')
    router.back()
  }, [])

  useRendezvous({
    name: 'idbox',
    onReady: onRendezvousReady,
    onMessage: onRendezvousMessage,
    onError: onRendezvousError
  })

  const renderButtonIfAppropriate = useCallback(() => {
    if (inProgress) {
      return <ActivityIndicator style={{ height: 38 }} />
    } else {
      console.log('renderButtonIfAppropriate:', isOwn)
      if (
        !isOwn ||
        (identityManager.current &&
          identityManager.current.identityNames.length > 1)
      ) {
        return (
          <Button
            title='Delete this identity'
            color='red'
            accessibilityLabel='delete identity'
            onPress={deleteIdentity}
          />
        )
      } else {
        return (
          <Description>
            This is your only identity. You can&apos;t delete it.
          </Description>
        )
      }
    }
  }, [isOwn, inProgress, deleteIdentity])

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: !inProgress,
          headerLeft: () => {
            return (
              <BackButton
                title='Identities'
                disabled={inProgress}
                onPress={() => router.back()}
              />
            )
          }
        }}
      />
      <Container>
        <SubContainer>
          <IdentityName>{name}</IdentityName>
          <Did>{did}</Did>
          <QRCodeThemed value={did} size={150} />
          <Separator size={40} />
          {identityManagerReady && renderButtonIfAppropriate()}
        </SubContainer>
      </Container>
    </>
  )
}

export { IdentityDetails }
