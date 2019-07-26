const createIdentity = async ({
  telepathChannel,
  name,
  publicEncryptionKey,
  publicSigningKey
}) => {
  console.log(`Creating identity: ${name}`)
  const message = {
    jsonrpc: '2.0',
    method: 'create_identity',
    params: [
      {
        name,
        publicEncryptionKey,
        publicSigningKey
      }
    ]
  }
  try {
    await telepathChannel.emit(message)
  } catch (e) {
    console.log(e.message)
  }
}

export { createIdentity }
