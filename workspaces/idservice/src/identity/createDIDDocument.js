const createDIDDocument = ({
  did,
  publicEncryptionKey,
  publicSigningKey
}) => {
  const timestamp = (new Date()).toISOString()
  return {
    '@context': {
      '/': 'zdpuAmoZixxJjvosviGeYcqduzDhSwGV2bL6ZTTXo1hbEJHfq'
    },
    created: timestamp,
    id: did,
    publicKey: [
      {
        id: `${did}#signing-key-1`,
        type: 'EdDsaPublicKey',
        controller: did,
        curve: 'ed25519',
        publicKeyBase64: publicSigningKey
      },
      {
        id: `${did}#encryption-key-1`,
        type: 'ECDHPublicKey',
        controller: did,
        curve: 'Curve25519',
        publicKeyBase64: publicEncryptionKey
      }
    ]
  }
}

export { createDIDDocument }
