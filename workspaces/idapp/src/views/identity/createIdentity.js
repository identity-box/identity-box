const createIdentity = async ({
  telepathChannel,
  name
}) => {
  console.log(`Creating identity: ${name}`)
  const message = {
    jsonrpc: '2.0',
    method: 'test',
    params: [
      1,
      'some string',
      {
        a: 'an object',
        b: 2
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
