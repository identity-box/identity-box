import {
  RendezvousClientConnection,
  RendezvousMessage
} from '@identity-box/rendezvous-client'

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
}

export { BoxServices }
