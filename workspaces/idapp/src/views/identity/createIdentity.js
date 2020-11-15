const createIdentity = async ({
  rendezvousConnection,
  keyName,
  publicEncryptionKey,
  publicSigningKey
}) => {
  console.log(`Creating identity: ${keyName}`)
  const message = {
    servicePath: 'identity-box.identity-service',
    method: 'create-identity',
    params: [{
      name: keyName,
      publicEncryptionKey,
      publicSigningKey
    }]
  }
  try {
    await rendezvousConnection.send(message)
  } catch (e) {
    console.log(e.message)
  }
}

export { createIdentity }
