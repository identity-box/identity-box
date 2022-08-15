import nacl from 'tweetnacl'
import base64url from 'base64url'
import { TypedArrays } from '@react-frontend-developer/buffers'

class Cryptographer {
  keyPair
  theirPublicKey
  prng

  get myPublicKey () {
    return this.keyPair.publicKey
  }

  constructor (prng) {
    this.prng = prng
  }

  generateKeyPair = async () => {
    await this.createKeyPair()
  }

  get ready () {
    return this.keyPair && this.theirPublicKey
  }

  randomBytes = async n => {
    if (this.prng) {
      return this.prng(n)
    } else {
      return nacl.randomBytes(n)
    }
  }

  encrypt = async msg => {
    if (!this.ready) {
      throw new Error('The cryptographic keys are not yet provided!')
    }
    const nonce = await this.randomBytes(nacl.box.nonceLength)
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

  createKeyPair = async () => {
    if (this.prng) {
      const secret = await this.randomBytes(nacl.box.publicKeyLength)
      let calledTimes = 0
      nacl.setPRNG((x, n) => {
        calledTimes = calledTimes + 1
        console.log(`PRNG called with secret=${secret}, times called: ${calledTimes}, n=${n}, x.length=${x.length}`)
        if (calledTimes > 1) {
          throw new Error(`PRNG: called more than one with the same secret ${secret}!`)
        }
        if (n !== nacl.box.publicKeyLength) {
          throw new Error(`PRNG: invalid length! Expected: ${nacl.box.publicKeyLength}, received: ${n}`)
        }
        for (let i = 0; i < n; i++) {
          x[i] = secret[i]
        }
      })
      this.keyPair = nacl.box.keyPair()
      nacl.setPRNG(() => { throw new Error('no PRNG') })
    } else {
      this.keyPair = nacl.box.keyPair()
    }
  }
}

export { Cryptographer }
