import { JsonRpcChannel } from './json-rpc-channel'

describe('JSON RPC Channel', () => {
  let jsonrpc
  let secureChannel

  beforeEach(() => {
    secureChannel = {
      emit: jest.fn(),
      createConnectUrl: jest.fn(),
      subscribe: jest.fn()
    }
    jsonrpc = new JsonRpcChannel({ channel: secureChannel })
  })

  it('can create a connect url', () => {
    const baseUrl = 'https://example.com'
    const url = 'https://example.com#connect'
    secureChannel.createConnectUrl.mockReturnValue(url)

    const connectUrl = jsonrpc.createConnectUrl(baseUrl)

    expect(secureChannel.createConnectUrl.mock.calls[0][0]).toEqual(baseUrl)
    expect(connectUrl).toEqual(url)
  })

  it('exposes id of the underlying secure channel', () => {
    const id = 'channel id'
    secureChannel.id = id

    jsonrpc = new JsonRpcChannel({ channel: secureChannel })
    expect(jsonrpc.id).toEqual(id)
  })

  it('exposes the key of the underlying secure channel', () => {
    const key = 'channel key'
    secureChannel.key = key

    jsonrpc = new JsonRpcChannel({ channel: secureChannel })
    expect(jsonrpc.key).toEqual(key)
  })

  it('exposes the appName of the underlying secure channel', () => {
    const appName = 'App Name'
    secureChannel.appName = appName

    jsonrpc = new JsonRpcChannel({ channel: secureChannel })
    expect(jsonrpc.appName).toEqual(appName)
  })

  it('exposes the clientId of the underlying secure channel', () => {
    const clientId = 'Some Random Client Id'
    secureChannel.clientId = clientId

    jsonrpc = new JsonRpcChannel({ channel: secureChannel })
    expect(jsonrpc.clientId).toEqual(clientId)
  })

  describe('message subscriptions', () => {
    const message = { jsonrpc: '2.0', method: 'test' }
    const invalidVersionMessage = { jsonrpc: '0.42', method: 'test' }
    const messageWithId = { jsonrpc: '2.0', id: 1, method: 'test' }
    const messageWithoutMethod = { jsonrpc: '2.0' }

    describe('subscribing', () => {
      let onMessage
      let onError

      beforeEach(() => {
        onMessage = jest.fn()
        onError = jest.fn()
      })

      it('does not silent errors thrown by the subscribe in secure channel', async () => {
        const expectedError = new Error('callback timeout')
        secureChannel.subscribe.mockRejectedValueOnce(expectedError)
        jsonrpc.subscribe(onMessage, onError)
        await expect(jsonrpc.connect()).rejects.toThrow(expectedError)
        expect(onError).not.toHaveBeenCalled()
      })
    })

    describe('outgoing', () => {
      it('hands valid message over to secure channel', async () => {
        jsonrpc.emit(message)
        expect(secureChannel.emit.mock.calls[0][0]).toEqual(
          JSON.stringify(message)
        )
      })

      it('throws when message is not in a json rpc 2.0 format', async () => {
        const expectedError = new Error('request is not a JSON-RPC 2.0 object')
        await expect(jsonrpc.emit(invalidVersionMessage)).rejects.toThrow(expectedError)
      })

      it('throws when message has an id', async () => {
        const expectedError = new Error('JSON-RPC message may not have an "id" property')
        await expect(jsonrpc.emit(messageWithId)).rejects.toThrow(expectedError)
      })

      it('throws when message does not specify a method', async () => {
        const expectedError = new Error('JSON-RPC request is missing a "method" property')
        await expect(jsonrpc.emit(messageWithoutMethod)).rejects.toThrow(expectedError)
      })
    })

    describe('incoming', () => {
      let onMessage
      let onError
      let channelOnMessageHandler

      beforeEach(async () => {
        onMessage = jest.fn()
        onError = jest.fn()
        jsonrpc.subscribe(onMessage, onError)
        await jsonrpc.connect()
        channelOnMessageHandler = secureChannel.subscribe.mock.calls[0][0]
      })

      it('passes incoming messages on', () => {
        channelOnMessageHandler(JSON.stringify(message))
        expect(onMessage).toBeCalledWith(message)
      })

      it('reports messages that are not in json rpc 2.0 format via onError', () => {
        const wrongMessage = JSON.stringify(invalidVersionMessage)
        channelOnMessageHandler(wrongMessage)
        expect(onMessage).not.toBeCalled()
        expect(onError).toHaveBeenCalledTimes(1)
        expect(onError).toHaveBeenCalledWith(new Error('request is not a JSON-RPC 2.0 object'))
      })

      it('reports messages with an id via onError', () => {
        const wrongMessage = JSON.stringify(messageWithId)
        channelOnMessageHandler(wrongMessage)
        expect(onMessage).not.toBeCalled()
        expect(onError).toHaveBeenCalledTimes(1)
        expect(onError).toHaveBeenCalledWith(new Error('JSON-RPC message may not have an "id" property'))
      })

      it('reports ignores messages without method via onError', () => {
        const wrongMessage = JSON.stringify(messageWithoutMethod)
        channelOnMessageHandler(wrongMessage)
        expect(onMessage).not.toBeCalled()
        expect(onError).toHaveBeenCalledTimes(1)
        expect(onError).toHaveBeenCalledWith(new Error('JSON-RPC request is missing a "method" property'))
      })
    })
  })
})
