import styled from '@emotion/native'
import { ThemeConstants } from '~/theme'
import * as Application from 'expo-application'

const VersionText = styled.Text(({ theme: { colorScheme } }) => ({
  color: ThemeConstants[colorScheme].deepDimmedTextColor
}))

const createVersionString = () => {
  return `version: ${Application.nativeApplicationVersion} build: ${Application.nativeBuildVersion}`
}

const Version = () => {
  return <VersionText>{createVersionString()}</VersionText>
}

export { Version }
