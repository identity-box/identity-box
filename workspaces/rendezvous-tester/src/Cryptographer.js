import nacl from 'tweetnacl'
import base64url from 'base64url'
import { TypedArrays } from '@react-frontend-developer/buffers'

class Cryptographer {
  keyPair
  theirPublicKey

  get myPublicKey () {
    return this.keyPair.publicKey
  }

  constructor () {
    this.createKeyPair()
  }

  get ready () {
    return this.keyPair && this.theirPublicKey
  }

  encrypt = msg => {
    if (!this.ready) {
      throw new Error('The cryptographic keys are not yet provided!')
    }
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const nonceEncoded = base64url.encode(nonce)
    const msgJson = JSON.stringify(msg)
    const msgEncoded = base64url.encode(msgJson)
    const box = nacl.box(
      TypedArrays.string2Uint8Array(msgEncoded),
      nonce,
      this.theirPublicKey,
      this.keyPair.secretKey
    )
    const boxEncoded = base64url.encode(box)
    return base64url.encode(JSON.stringify({
      encryptedMessage: boxEncoded,
      encodedNonce: nonceEncoded
    }))
  }

  decrypt = encodedBox => {
    if (!this.ready) {
      throw new Error('The cryptographic keys are not yet provided!')
    }
    const { encryptedMessage, encodedNonce } = JSON.parse(base64url.decode(encodedBox))
    const box = base64url.toBuffer(encryptedMessage)
    const nonce = base64url.toBuffer(encodedNonce)
    const decryptedBox = nacl.box.open(box, nonce, this.theirPublicKey, this.keyPair.secretKey)
    const decryptedEncoded = TypedArrays.uint8Array2string(decryptedBox)
    return JSON.parse(base64url.decode(decryptedEncoded))
  }

  createKeyPair = () => {
    this.keyPair = nacl.box.keyPair()
  }
}

export { Cryptographer }
