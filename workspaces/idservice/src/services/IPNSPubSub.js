import got from 'got'

const nameServiceUrl =
  process.env.IDBOX_NAMESERVICE_URL || 'http://localhost:3100/'

const sendCommandToNameService = json => {
  return got(nameServiceUrl, {
    method: 'POST',
    json,
    timeout: 25000
  }).json()
}

class IPNSPubSub {
  static connect = () => {

  }

  static setIPNSRecord = async ({
    ipnsName,
    cid
  }) => {
    const cmd = {
      method: 'publish-name',
      ipnsName,
      cid
    }
    return sendCommandToNameService(cmd)
  }

  static getCIDForIPNSName = async ({
    ipnsName
  }) => {
    const cmd = {
      method: 'resolve-name',
      ipnsName
    }
    return sendCommandToNameService(cmd)
  }

  static deleteIPNSRecord = async ({
    ipnsName
  }) => {
    const cmd = {
      method: 'unpublish-name',
      ipnsName
    }
    return sendCommandToNameService(cmd)
  }
}

export { IPNSPubSub }
