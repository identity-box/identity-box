import { Buffers } from '@react-frontend-developer/buffers'
import base64url from 'base64url'
import * as SecureStore from 'expo-secure-store'
import { BoxServices } from '~/box-services'
import { IdentityManager } from '~/identity'
import { backupIdFromBackupKey } from './backupIdFromBackupKey'

const initiateBackup = async (
  boxServices: BoxServices,
  identityManager: IdentityManager
) => {
  const backupEnabled = await SecureStore.getItemAsync('backupEnabled')
  const backupKeyBase64 = await SecureStore.getItemAsync('backupKey')
  if (backupEnabled && backupKeyBase64) {
    const backupKey = Buffers.copyToUint8Array(
      base64url.toBuffer(backupKeyBase64)
    )
    const encryptedBackup = await identityManager.createEncryptedBackupWithKey(
      backupKey
    )
    const backupId = backupIdFromBackupKey(backupKey)
    await boxServices.writeBackupToIdBox(
      encryptedBackup,
      backupId,
      identityManager.keyNames
    )
    return true
  } else {
    return false
  }
}

export { initiateBackup }
