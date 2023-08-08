import base64url from 'base64url'
import nacl from 'tweetnacl'
import { LogDb } from '~/views/diagnostics'
import { entropyToMnemonic } from './mnemonic/entropyToMnemonic'
import { TypedArrays } from '@react-frontend-developer/buffers'

const backupIdFromBackupKey = (backupKey: Uint8Array) => {
  const mnemonic = entropyToMnemonic(backupKey)
  if (!mnemonic) {
    LogDb.log(
      'backupIdFromBackupKey: entropyToMnemonic(backupKey) returns undefined!'
    )
    throw new Error('FATAL: error creating mnemonic from backup key!')
  }
  const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic)
  return base64url.encode(Buffer.from(nacl.hash(mnemonicUint8Array)))
}

export { backupIdFromBackupKey }
