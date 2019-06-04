class Telepath {
  constructor (serviceUrl) {
    this.serviceUrl = serviceUrl
  }

  createChannel = ({ id, key, appName }) => {
    const channel = new SecureChannel({ id, key, appName })
    return new JsonRpcChannel({ channel })
  }
}

var nextKey = 1

class JsonRpcChannel {
  constructor ({ channel }) {
    this.channel = channel
    this.subscriptions = []
  }

  createConnectUrl () {
    return 'connectUrl'
  }

  get id () {
    return this.channel.id || Date.now().toString()
  }

  get key () {
    return this.channel.key || Uint8Array.of(nextKey++)
  }

  get appName () {
    return this.channel.appName
  }

  subscribe (onMessage, onError) {
    this.subscriptions.push({ onMessage, onError })
    return this.subscriptions.length - 1
  }

  unsubscribe (subscription) {
    this.subscriptions[subscription] = null
  }

  fakeIncomingMessage (message) {
    this.subscriptions.forEach(subscription => {
      if (subscription) {
        subscription.onMessage(message)
      }
    })
  }
}

class SecureChannel {
  constructor ({ id, key, appName }) {
    this.id = id
    this.key = key
    this.appName = appName
  }
}

export { Telepath }
