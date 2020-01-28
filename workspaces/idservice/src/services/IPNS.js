import { IPNSPubSub } from './IPNSPubSub'
import { IPNSFirebase } from './IPNSFirebase'

let ipns = IPNSPubSub

class IPNS {
  static use = ipnsInterfaceName => {
    switch (ipnsInterfaceName.toLowerCase()) {
      case 'firebase':
        ipns = IPNSFirebase
        break
      default:
        ipns = IPNSPubSub
        break
    }
  }

  static connect = () => {
    return ipns.connect()
  }

  static setIPNSRecord = ({
    ipnsName,
    cid
  }) => {
    return ipns.setIPNSRecord({
      ipnsName,
      cid
    })
  }

  static getCIDForIPNSName = ({
    ipnsName
  }) => {
    return ipns.getCIDForIPNSName({ ipnsName })
  }

  static deleteIPNSRecord = async ({
    ipnsName
  }) => {
    return ipns.deleteIPNSRecord({ ipnsName })
  }
}

export { IPNS }
