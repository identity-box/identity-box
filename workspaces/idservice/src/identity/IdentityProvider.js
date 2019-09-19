import fs from 'fs'
import path from 'path'
import crypto from 'libp2p-crypto'
import ipfsClient from 'ipfs-http-client'
import { IPNSFirebase } from '../services'

class IdentityProvider {
  password = process.env.IDBOX_BACKUP_PASSWORD
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

  getKeyPath = name => {
    return path.join(process.env.IPFS_PATH, 'keystore', name)
  }

  getBackupPath = name => {
    return path.join(process.env.IDBOX_BACKUP, `${name}.pem`)
  }

  exportPEM = async name => {
    const buf = fs.readFileSync(this.getKeyPath(name))
    const key = await crypto.keys.unmarshalPrivateKey(buf)
    const pem = await key.export(this.password)
    return pem
  }

  backupName = async name => {
    const pem = await this.exportPEM(name)
    fs.writeFileSync(this.getBackupPath(name), pem, { mode: 0o644 })
  }

  backupIds = async encryptedBackup => {
    const backupPath = path.join(process.env.IDBOX_BACKUP, 'backup')
    fs.writeFileSync(backupPath, encryptedBackup, { mode: 0o644 })
  }

  backup = async ({ encryptedBackup }) => {
    await this.backupIds(encryptedBackup)
    const keys = await this.ipfs.key.list()
    await Promise.all(keys.map(async ({ name }) => {
      if (name === 'self') return
      console.log('backing up key: ', name)
      await this.backupName(name)
    }))
  }
}

export { IdentityProvider }
