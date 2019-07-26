import base64url from 'base64url'
import { MessageDispatcher } from './message-dispatcher'

class JsonRpcChannel {
  channel
  dispatcher

  constructor ({ channel }) {
    this.channel = channel
    this.dispatcher = new MessageDispatcher()
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

  get clientId () {
    return this.channel.clientId
  }

  processMessage = message => {
    const messageJSON = JSON.parse(message)
    this.checkJsonRpcMessage(messageJSON)
    return messageJSON
  }

  checkJsonRpcMessage = message => {
    if (message.jsonrpc !== '2.0') {
      throw new Error('request is not a JSON-RPC 2.0 object')
    }
    if (message.id !== undefined) {
      throw new Error('JSON-RPC message may not have an "id" property')
    }
    if (message.method === undefined) {
      throw new Error('JSON-RPC request is missing a "method" property')
    }
  }

  connect = async () => {
    await this.channel.subscribe(message => {
      try {
        this.dispatcher.onMessage(this.processMessage(message))
      } catch (e) {
        this.dispatcher.onError(e)
      }
    }, error => this.dispatcher.onError(error))
  }

  subscribe = (onMessage, onError) => {
    const subscription = this.dispatcher.addSubscription(onMessage, onError)
    return subscription
  }

  unsubscribe = subscription => {
    this.dispatcher.removeSubscription(subscription)
  }

  emit = async message => {
    this.checkJsonRpcMessage(message)
    await this.channel.emit(JSON.stringify(message))
  }

  createConnectUrl = baseUrl => {
    return this.channel.createConnectUrl(baseUrl)
  }

  describe = ({ baseUrl }) => {
    console.log('---------------------------------------------------------')
    console.log(`channelId: ${this.channel.id}`)
    console.log(`channelKey: ${base64url.encode(this.channel.key)}`)
    console.log(`appName: ${this.channel.appName}`)
    console.log(`clientId: ${this.channel.clientId}`)
    console.log(`connectUrl: ${this.channel.createConnectUrl(baseUrl)}`)
    console.log('---------------------------------------------------------')
  }
}

export { JsonRpcChannel }
