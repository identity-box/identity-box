import { ServiceBroker } from './ServiceBroker'

class IPNSPubSub {
  static sendCommandToNameService = async request => {
    return ServiceBroker.getInstance().dispatch({
      servicePath: 'identity-box.nameservice',
      ...request
    })
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
