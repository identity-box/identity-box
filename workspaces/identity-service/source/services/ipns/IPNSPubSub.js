import { ServiceProxy } from '@identity-box/utils'

class IPNSPubSub {
  static sendCommandToNameService = async request => {
    const serviceProxy = new ServiceProxy('identity-box.nameservice')

    const response = await serviceProxy.send(request)
    return response.response
  }

  static connect = () => {
  }

  static setIPNSRecord = async ({
    ipnsName,
    cid
  }) => {
    const request = {
      method: 'publish-name',
      params: [
        {
          ipnsName,
          cid
        }
      ]
    }
    return IPNSPubSub.sendCommandToNameService(request)
  }

  static getCIDForIPNSName = async ({
    ipnsName
  }) => {
    const request = {
      method: 'resolve-name',
      params: [{ ipnsName }]
    }
    return IPNSPubSub.sendCommandToNameService(request)
  }

  static deleteIPNSRecord = async ({
    ipnsName
  }) => {
    const request = {
      method: 'unpublish-name',
      params: [{ ipnsName }]
    }
    return IPNSPubSub.sendCommandToNameService(request)
  }
}

export { IPNSPubSub }
