import nacl from 'tweetnacl'
import base64url from 'base64url'

const ASSOCIATION_STRING_NONCE_LENGTH = 32

class Iam {
  static __instance

  static getInstance = () => {
    if (!this.__instance) {
      this.__instance = new Iam()
    }
    return this.__instance
  }

  createNewKeyPair = () => {
    return nacl.box.keyPair()
  }

  createAssociationString = ({ secretKey, rendezvousUrl }) => {
    const { publicKey } = nacl.box.keyPair.fromSecretKey(secretKey)
    const nonce = nacl.randomBytes(ASSOCIATION_STRING_NONCE_LENGTH)

    const associationObject = {
      rendezvousUrl: base64url.encode(rendezvousUrl),
      publicKey: base64url.encode(publicKey),
      nonce: base64url.encode(nonce)
    }

    const associationString = JSON.stringify(associationObject)

    return base64url.encode(associationString)
  }
}

export { Iam }
