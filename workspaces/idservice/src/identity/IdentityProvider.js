import ipfsClient from 'ipfs-http-client'

class IdentityProvider {
  ipfs

  id

  constructor () {
    this.ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
  }

  createNew = async ({
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
    this.id = await this.ipfs.key.gen(name, {
      type: 'rsa',
      size: 2048
    })
    return {
      did: `did:ipid:${this.id.id}`,
      name: this.id.name
    }
  }

  writeToIPFS = async didDoc => {
    const cid = await this.ipfs.dag.put(
      didDoc,
      { format: 'dag-cbor', hashAlg: 'sha2-256' }
    )
    return cid.toBaseEncodedString()
  }

  ipnsNameFromDID = did => {
    const match = did.match(/did:ipid:(.*)$/)
    return match && match[1]
  }
}

export { IdentityProvider }
