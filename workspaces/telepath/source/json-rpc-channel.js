import { NotificationsDispatcher } from './notifications-dispatcher'

class JsonRpcChannel {
  constructor ({ channel }) {
    this.channel = channel
  }

  get id () {
    return this.channel.id
  }

  get key () {
    return this.channel.key
  }

  get appName () {
    return this.channel.appName
  }

  async startNotifications () {
    this.notificationsDispatcher = new NotificationsDispatcher()
    await this.startNotificationsWithCallbacks(notification =>
      this.notificationsDispatcher.onNotification(notification),
    error => this.notificationsDispatcher.onError(error))
  }

  async startNotificationsWithCallbacks (notificationHandler, errorHandler) {
    await this.channel.startNotifications(message => {
      this.onNotification(message, notificationHandler)
    }, errorHandler)
  }

  subscribeForNotifications (onNotification, onError) {
    if (!this.notificationsDispatcher) {
      if (onError) {
        onError(new Error('Call `startNotifications` before subscribing'))
      }
      return
    }
    return this.notificationsDispatcher.addSubscription(onNotification, onError)
  }

  unsubscribeForNotifications (subscription) {
    if (!this.notificationsDispatcher) {
      return
    }
    this.notificationsDispatcher.removeSubscription(subscription)
  }

  async notify (notification) {
    checkJsonRpcStructure(notification, true)
    this.channel.notify(JSON.stringify(notification))
  }

  onNotification (message, notificationHandler) {
    const notification = parseResponse(message)
    try {
      checkJsonRpcStructure(notification, true)
      notificationHandler(notification)
    } catch {
      // ditching invalid JSON-RPC notification
    }
  }

  createConnectUrl (baseUrl) {
    return this.channel.createConnectUrl(baseUrl)
  }
}

function checkJsonRpcStructure (structure, isNotification) {
  if (structure.jsonrpc !== '2.0') {
    throw new Error('request is not a JSON-RPC 2.0 object')
  }
  if (isNotification) {
    if (structure.id !== undefined) {
      throw new Error('JSON-RPC notification may not have an "id" property')
    }
  } else {
    if (structure.id === undefined) {
      throw new Error('JSON-RPC request is missing an "id" property')
    }
  }
  if (structure.method === undefined) {
    throw new Error('JSON-RPC request is missing a "method" property')
  }
}

function parseResponse (response) {
  try {
    return JSON.parse(response)
  } catch (error) {
    return response
  }
}

export { JsonRpcChannel }
