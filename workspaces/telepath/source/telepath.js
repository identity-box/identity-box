import base64url from 'base64url'
import nacl from 'tweetnacl'
import { SecureChannel } from './secure-channel'
import { JsonRpcChannel } from './json-rpc-channel'
import { SocketIOChannel } from './socket-io-channel'
import io from 'socket.io-client'

class Telepath {
  constructor (serviceUrl) {
    this.serviceUrl = serviceUrl
  }

  createChannel = ({ id, key, appName }) => {
    if (!appName) {
      throw new Error('appName is a required parameter')
    }
    const channelId = id || createRandomId()
    const channelKey = key || createRandomKey()
    const socketIOChannel = new SocketIOChannel(() => {
      return io(this.serviceUrl, { autoConnect: false })
    })
    const channel = new SecureChannel({
      id: channelId,
      key: channelKey,
      appName: appName,
      socketIOChannel
    })
    return new JsonRpcChannel({ channel })
  }
}

const createRandomId = () => {
  const idSize = 18
  const idBytes = nacl.randomBytes(idSize)
  return base64url.encode(idBytes)
}

const createRandomKey = () => {
  return nacl.randomBytes(nacl.secretbox.keyLength)
}

export { Telepath }
