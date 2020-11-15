import fs from 'fs'
import path from 'path'
import glob from 'glob'
import crypto from 'libp2p-crypto'
import base32encode from 'base32-encode'
import { IPNS } from './ipns'

class IdentityProvider {
  password = process.env.IDBOX_BACKUP_PASSWORD
  ipfs
  id

  constructor (ipfs) {
    this.ipfs = ipfs
  }

  createIdentity = async message => {
    const identity = await this.createNew(message.params[0])

    const didDoc = this.createDIDDocument({
      ...identity,
      ...message.params[0]
    })
    const cid = await this.writeToIPFS(didDoc)
    await this.pin(cid)
    console.log('cid:', cid)
    const ipnsName = this.ipnsNameFromDID(identity.did)
    console.log('ipns name:', ipnsName)
    await IPNS.setIPNSRecord({
      ipnsName,
      cid
    })
    return {
      method: 'create-identity-response',
      params: [
        { identity }
      ]
    }
  }

  getDIDDocument = async message => {
    const { did } = message.params[0]
    const ipnsName = this.ipnsNameFromDID(did)
    const { cid } = await IPNS.getCIDForIPNSName({ ipnsName })
    const didDocument = await this.readFromIPFS(cid)
    return {
      method: 'get-did-document-response',
      params: [
        didDocument
      ]
    }
  }

  storeJSON = async message => {
    const json = message.params[0]
    const cid = await this.writeToIPFS(json)
    await this.pin(cid)
    return {
      method: 'store-json-response',
      params: [
        { cid }
      ]
    }
  }

  getJSON = async message => {
    const { cid } = message.params[0]
    const { json } = await this.readFromIPFS(cid)
    return {
      method: 'get-json-response',
      params: [
        { json }
      ]
    }
  }

  reset = async message => {
    const { identityNames } = message.params[0]
    await this.deleteAll(identityNames)
    return {
      method: 'reset-response'
    }
  }

  backup = async message => {
    const { encryptedBackup, backupId, identityNames } = message.params[0]
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
    return {
      method: 'backup-response'
    }
  }

  hasBackup = () => {
    const backupFiles = glob.sync('*', {
      cwd: process.env.IDBOX_BACKUP
    })
    const backupPresent = (backupFiles.length > 0)
    return {
      method: 'has-backup-response',
      params: [
        { hasBackup: backupPresent }
      ]
    }
  }

  restore = async message => {
    const { backupId } = message.params[0]
    let encryptedBackup
    if (this.backupExists(backupId)) {
      encryptedBackup = this.restoreIds(backupId)
      await this.restoreNames(backupId)
      await this.restoreDIDDocuments(backupId)
    } else {
      encryptedBackup = 'not found'
    }
    return {
      method: 'restore-response',
      params: [
        { encryptedBackup }
      ]
    }
  }

  deleteIdentity = async message => {
    const { identityName: name } = message.params[0]
    const allKeys = await this.ipfs.key.list()
    const keys = allKeys.filter(k => k.name === name)
    if (keys.length === 1) {
      const { id: ipnsName } = keys[0]
      console.log(`deleting key ${name} with IPNS name ${ipnsName}`)
      await IPNS.deleteIPNSRecord({ ipnsName })
      await this.ipfs.key.rm(name)
    }
    return {
      method: 'delete-response'
    }
  }

  migrate = async message => {
    const { migration } = message.params[0]
    switch (migration.migrationType) {
      case 'KEY-NAMING':
        await this.migrateKeyNames(migration.migrationData)
        break
      default:
        console.log('unknown migration - ignoring!')
    }
    return {
      method: 'migrate-response'
    }
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

  createDIDDocument = ({
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
    console.log('Identity Names!!!!:', identityNames)
    const allKeys = await this.ipfs.key.list()
    const keys = allKeys.filter(k => identityNames.includes(k.name))
    await Promise.all(keys.map(async ({ name }) => {
      if (name === 'self') return
      console.log('deleting key: ', name)
      await this.ipfs.key.rm(name)
    }))
    // Currently we just unpublish the names but in the future we may decide
    // to have an apart user action to remove "old" identities.
    // When we deleteIPNS record, the corresponding identity will
    // not be "resolvable" anymore. This may not alwys be intented as
    // sometimes you may just reset your box, but you do not want
    // your identities to become "unavailbale" in the meantime.
    await Promise.all(keys.map(async ({ id: ipnsName, name }) => {
      if (name === 'self') return
      console.log('deleting IPNS name: ', ipnsName)
      await IPNS.deleteIPNSRecord({ ipnsName })
    }))
  }

  getKeyPath = name => {
    const encodedName = base32encode(Buffer.from(name), 'RFC4648', { padding: false })
    return path.join(process.env.IPFS_PATH, 'keystore', `key_${encodedName}`)
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
    const { cid } = await IPNS.getCIDForIPNSName({ ipnsName })
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
      await IPNS.setIPNSRecord({
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

  migrateKeyNames = async migrationData => {
    console.log('migrationData=', migrationData)
    await Promise.all(migrationData.map(async ({ oldName, newName }) => {
      await this.ipfs.key.rename(oldName, newName)
    }))
  }
}

export { IdentityProvider }
