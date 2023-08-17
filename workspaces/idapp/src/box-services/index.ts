import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'

type Migration = {
  migrationType: 'KEY-NAMING'
  migrationData: Array<{
    oldName: string
    newName: string
  }>
}

class BoxServices {
  rendezvousConnection

  static withConnection(rendezvousConnection: RendezvousClientConnection) {
    return new BoxServices(rendezvousConnection)
  }

  constructor(rendezvousConnection: RendezvousClientConnection) {
    this.rendezvousConnection = rendezvousConnection
  }

  sendMessageToIdBox = async (message: RendezvousMessage) => {
    try {
      await this.rendezvousConnection.send(message)
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(e.message)
      } else {
        console.warn('unknown error!')
      }
    }
  }

  writeBackupToIdBox = async (
    encryptedBackup: string,
    backupId: string,
    identityNames: string[]
  ) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'backup',
      params: [
        {
          encryptedBackup,
          backupId,
          identityNames
        }
      ]
    }
    this.sendMessageToIdBox(message)
  }

  deleteIdentityOnIdBox = async (name: string) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'delete',
      params: [
        {
          identityName: name
        }
      ]
    }
    this.sendMessageToIdBox(message)
  }

  resetIdBox = async (identityNames: Array<string>) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'reset',
      params: [
        {
          identityNames
        }
      ]
    }
    this.sendMessageToIdBox(message)
  }

  checkForBackup = async () => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'has-backup',
      params: []
    }
    this.sendMessageToIdBox(message)
  }

  createIdentity = async ({
    keyName,
    publicEncryptionKey,
    publicSigningKey
  }: {
    keyName: string
    publicEncryptionKey: string
    publicSigningKey: string
  }) => {
    console.log(`Creating identity: ${keyName}`)
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'create-identity',
      params: [
        {
          name: keyName,
          publicEncryptionKey,
          publicSigningKey
        }
      ]
    }
    this.sendMessageToIdBox(message)
  }

  restoreIdBox = async (backupId: string) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'restore',
      params: [
        {
          backupId
        }
      ]
    }
    this.sendMessageToIdBox(message)
  }

  migrate = async (migration: Migration) => {
    const message = {
      servicePath: 'identity-box.identity-service',
      method: 'migrate',
      params: [
        {
          migration
        }
      ]
    }
    this.sendMessageToIdBox(message)
  }
}

export { BoxServices }
export type { Migration }
