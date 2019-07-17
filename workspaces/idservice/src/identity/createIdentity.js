const createIdentity = ({
  name,
  publicEncryptionKey,
  publicSigningKey
}) => {
  console.log('-------------------------------------------')
  console.log('creating identity:')
  console.log('name:', name)
  console.log('publicEncryptionKey:', publicEncryptionKey)
  console.log('publicSigningKey:', publicSigningKey)
  console.log('-------------------------------------------')
  return 'QmevpVT42bVGWoz76u1naEfjPVdwptqQVugevNmXUJPCbi'
}

export { createIdentity }
