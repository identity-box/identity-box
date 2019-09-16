import ipfsClient from 'ipfs-http-client'
import { IPNSFirebase } from '../services'

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

  writeToIPFS = async json => {
    const cid = await this.ipfs.dag.put(
      json,
      { format: 'dag-cbor', hashAlg: 'sha2-256' }
    )
    return cid.toBaseEncodedString()
  }

  pin = async hash => {
    await this.ipfs.pin.add(hash)
  }

  readFromIPFS = async cid => {
    const { value } = await this.ipfs.dag.get(cid)
    return value
  }

  ipnsNameFromDID = did => {
    const match = did.match(/did:ipid:(.*)$/)
    return match && match[1]
  }

  deleteAll = async () => {
    const keys = await this.ipfs.key.list()
    await Promise.all(keys.map(async ({ name }) => {
      if (name === 'self') return
      console.log('deleting key: ', name)
      await this.ipfs.key.rm(name)
    }))
    await Promise.all(keys.map(async ({ id: ipnsName, name }) => {
      if (name === 'self') return
      console.log('deleting IPNS name: ', ipnsName)
      await IPNSFirebase.deleteIPNSRecord({ ipnsName })
    }))
  }
}

export { IdentityProvider }
