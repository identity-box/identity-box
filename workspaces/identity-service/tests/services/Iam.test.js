import base64url from 'base64url'
import nacl from 'tweetnacl'
// import fs from 'fs'
import { Buffers } from '@react-frontend-developer/buffers'
import { Iam } from '../../source/services/Iam'

jest.mock('fs')

describe('Iam', () => {
  const rendezvousUrl = 'https://rendezvous.example.com'
  let iam

  beforeEach(() => {
    iam = new Iam()
  })

  it('allows creating a new key pair', () => {
    const keyPair = iam.createNewKeyPair()

    expect(keyPair).not.toBeNull()
    expect(keyPair.publicKey).not.toBeNull()
    expect(keyPair.publicKey instanceof Uint8Array).toBeTruthy()
    expect(keyPair.secretKey).not.toBeNull()
    expect(keyPair.secretKey instanceof Uint8Array).toBeTruthy()
  })

  it('creates association string for the given private key', () => {
    const keyPair = nacl.box.keyPair()
    const associationString = iam.createAssociationString({
      secretKey: keyPair.secretKey,
      rendezvousUrl
    })

    expect(associationString).not.toBeNull()

    const associationObject = JSON.parse(base64url.decode(associationString))
    expect(base64url.decode(associationObject.rendezvousUrl)).toEqual(rendezvousUrl)
    expect(Buffers.copyToUint8Array(base64url.toBuffer(associationObject.publicKey))).toEqual(keyPair.publicKey)
    expect(Buffers.copyToUint8Array(base64url.toBuffer(associationObject.nonce))).toBeDefined()
  })
})
