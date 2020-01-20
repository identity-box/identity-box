import base64url from 'base64url'
import nacl from 'tweetnacl'
import { TypedArrays } from '@react-frontend-developer/buffers'

if (process.argv.length < 3) {
  console.error('No mnemonic argument provided', process.argv)
  process.exit(1)
}

const mnemonic = process.argv[2].trim()

const backupIdFromMnemonic = mnemonic => {
  const mnemonicUint8Array = TypedArrays.string2Uint8Array(mnemonic, 'utf8')
  return base64url.encode(nacl.hash(mnemonicUint8Array))
}

console.log(backupIdFromMnemonic(mnemonic))
