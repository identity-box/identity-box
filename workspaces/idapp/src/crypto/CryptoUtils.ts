import nacl from 'tweetnacl'
import base64url from 'base64url'

import { randomBytes } from './randomBytes'

class CryptoUtils {
  static createRandomIdentityKeyName = async () => {
    const randomValue = await randomBytes(10)
    const timestamp = Date.now()
    return `${timestamp}${base64url.encode(Buffer.from(randomValue))}`
  }

  static createEncryptionKeyPair = async () => {
    const secretKey = await randomBytes(nacl.box.secretKeyLength)
    return nacl.box.keyPair.fromSecretKey(secretKey)
  }

  static createSigningKeyPair = async () => {
    const secret = await randomBytes(nacl.sign.publicKeyLength)
    nacl.setPRNG((x, n) => {
      if (n !== nacl.sign.publicKeyLength) {
        throw new Error(
          `PRNG: invalid length! Expected: ${nacl.sign.publicKeyLength}, received: ${n}`
        )
      }
      for (let i = 0; i < n; i++) {
        x[i] = secret[i]
      }
    })
    const signingKeyPair = nacl.sign.keyPair()

    nacl.setPRNG(() => {
      throw new Error('no PRNG')
    })

    return signingKeyPair
  }
}

export { CryptoUtils }
