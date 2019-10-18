const createIdentity = async ({
  telepathChannel,
  keyName,
  publicEncryptionKey,
  publicSigningKey
}) => {
  console.log(`Creating identity: ${keyName}`)
  const message = {
    jsonrpc: '2.0',
    method: 'create-identity',
    params: [{
      name: keyName,
      publicEncryptionKey,
      publicSigningKey
    }, {
      from: telepathChannel.clientId
    }]
  }
  try {
    await telepathChannel.emit(message, {
      to: telepathChannel.servicePointId
    })
  } catch (e) {
    console.log(e.message)
  }
}

export { createIdentity }
