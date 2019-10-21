import fs from 'fs'
import path from 'path'
import glob from 'glob'
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

  deleteAll = async identityNames => {
    const allKeys = await this.ipfs.key.list()
    const keys = allKeys.filter(k => identityNames.includes(k.name))
    await Promise.all(keys.map(async ({ name }) => {
      if (name === 'self') return
      console.log('deleting key: ', name)
      await this.ipfs.key.rm(name)
    }))
    // lets keep IPNS association for now
    // maybe we need to have a separate API to clean the IDBox completely
    // including unpinning cids
    // await Promise.all(keys.map(async ({ id: ipnsName, name }) => {
    //   if (name === 'self') return
    //   console.log('deleting IPNS name: ', ipnsName)
    //   await IPNSFirebase.deleteIPNSRecord({ ipnsName })
    // }))
  }

  deleteIdentity = async name => {
    const allKeys = await this.ipfs.key.list()
    const keys = allKeys.filter(k => k.name === name)
    if (keys.length === 1) {
      const { id: ipnsName } = keys[0]
      console.log(`deleting key ${name} with IPNS name ${ipnsName}`)
      await IPNSFirebase.deleteIPNSRecord({ ipnsName })
      await this.ipfs.key.rm(name)
    }
  }

  getKeyPath = name => {
    return path.join(process.env.IPFS_PATH, 'keystore', name)
  }

  getBackupPath = (name, backupId) => {
    return path.join(process.env.IDBOX_BACKUP, backupId, `${name}.pem`)
  }

  getBackupFolderPath = backupId => {
    return path.join(process.env.IDBOX_BACKUP, backupId, 'did-docs')
  }

  getDIDDocumentPath = (backupId, ipnsName) => {
    return path.join(process.env.IDBOX_BACKUP, backupId, 'did-docs', ipnsName)
  }

  exportPEM = async name => {
    const buf = fs.readFileSync(this.getKeyPath(name))
    const key = await crypto.keys.unmarshalPrivateKey(buf)
    const pem = await key.export(this.password)
    return pem
  }

  importPEM = async (name, pem) => {
    const key = await crypto.keys.import(pem, this.password)
    const buf = await crypto.keys.marshalPrivateKey(key)

    fs.writeFileSync(this.getKeyPath(name), buf, { mode: 0o644 })
  }

  backupName = async (name, backupId) => {
    const pem = await this.exportPEM(name)
    fs.writeFileSync(this.getBackupPath(name, backupId), pem, { mode: 0o644 })
  }

  backupDIDDocument = async (ipnsName, backupId) => {
    const cid = await IPNSFirebase.getCIDForIPNSName({ ipnsName })
    const didDocument = await this.readFromIPFS(cid)
    fs.writeFileSync(this.getDIDDocumentPath(backupId, ipnsName), JSON.stringify(didDocument), { mode: 0o644 })
  }

  backupIds = (encryptedBackup, backupId) => {
    const backupPath = path.join(process.env.IDBOX_BACKUP, backupId, 'backup')
    fs.writeFileSync(backupPath, encryptedBackup, { mode: 0o644 })
  }

  createBackupFolders = backupId => {
    fs.rmdirSync(path.join(process.env.IDBOX_BACKUP, backupId), { recursive: true })
    fs.mkdirSync(this.getBackupFolderPath(backupId), { recursive: true, mode: 0o755 })
  }

  backup = async ({ encryptedBackup, backupId, identityNames }) => {
    this.createBackupFolders(backupId)
    this.backupIds(encryptedBackup, backupId)
    const allKeys = await this.ipfs.key.list()
    const keys = allKeys.filter(k => identityNames.includes(k.name))
    await Promise.all(keys.map(async ({ name, id }) => {
      if (name === 'self') return
      console.log('backing up key: ', name)
      await this.backupName(name, backupId)
      await this.backupDIDDocument(id, backupId)
    }))
  }

  hasBackup = () => {
    const backupFiles = glob.sync('*', {
      cwd: process.env.IDBOX_BACKUP
    })
    return backupFiles.length > 0
  }

  restoreIds = backupId => {
    const backupPath = path.join(process.env.IDBOX_BACKUP, backupId, 'backup')
    return fs.readFileSync(backupPath, 'utf8')
  }

  restoreDIDDocuments = async backupId => {
    const ipnsNames = glob.sync('*', {
      cwd: this.getBackupFolderPath(backupId)
    })
    await Promise.all(ipnsNames.map(async ipnsName => {
      const didDoc = JSON.parse(fs.readFileSync(this.getDIDDocumentPath(backupId, ipnsName), 'utf8'))
      const cid = await this.writeToIPFS(didDoc)
      console.log(`restoring DIDDocument with IPNS name ${ipnsName} and CID ${cid}`)
      await this.pin(cid)
      await IPNSFirebase.setIPNSRecord({
        ipnsName,
        cid
      })
    }))
  }

  restoreNames = async backupId => {
    const pems = glob.sync('*.pem', {
      cwd: path.join(process.env.IDBOX_BACKUP, backupId)
    })
    await Promise.all(pems.map(async pemFileName => {
      const name = pemFileName.replace(/\.pem$/, '')
      const pem = fs.readFileSync(this.getBackupPath(name, backupId), 'utf8')
      await this.importPEM(name, pem)
    }))
  }

  backupExists = backupId => {
    return fs.existsSync(path.join(process.env.IDBOX_BACKUP, backupId))
  }

  restore = async ({ backupId }) => {
    if (this.backupExists(backupId)) {
      const encryptedBackup = this.restoreIds(backupId)
      await this.restoreNames(backupId)
      await this.restoreDIDDocuments(backupId)
      return encryptedBackup
    } else {
      return 'not found'
    }
  }

  migrateKeyNames = async migrationData => {
    console.log('migrationData=', migrationData)
    await Promise.all(migrationData.map(async ({ oldName, newName }) => {
      await this.ipfs.key.rename(oldName, newName)
    }))
  }

  migrate = async ({ migration }) => {
    switch (migration.migrationType) {
      case 'KEY-NAMING':
        await this.migrateKeyNames(migration.migrationData)
        break
      default:
        console.log('unknown migration - ignoring!')
    }
  }
}

export { IdentityProvider }
