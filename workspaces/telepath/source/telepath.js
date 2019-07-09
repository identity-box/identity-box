import { SecureChannel } from './secure-channel'
import { JsonRpcChannel } from './json-rpc-channel'
import { SocketIOChannel } from './socket-io-channel'
import io from 'socket.io-client'

class Telepath {
  constructor ({ serviceUrl, randomBytes }) {
    this.serviceUrl = serviceUrl
    this.randomBytes = randomBytes
  }

  createChannel = ({ id, key, appName, clientId }) => {
    if (!id || !key || !appName) {
      throw new Error('id, key, or appName is missing!')
    }
    const channelId = id
    const channelKey = key
    const socketIOChannel = new SocketIOChannel({
      clientId,
      socketFactoryMethod: () => {
        return io(this.serviceUrl, { autoConnect: false })
      }
    })
    const channel = new SecureChannel({
      id: channelId,
      key: channelKey,
      appName: appName,
      clientId,
      socketIOChannel,
      randomBytes: this.randomBytes
    })
    return new JsonRpcChannel({ channel })
  }
}

export { Telepath }
