import { JsonRpcChannel } from './json-rpc-channel'

describe('JSON RPC Channel', () => {
  let jsonrpc
  let channel

  beforeEach(() => {
    channel = {
      emit: jest.fn(),
      createConnectUrl: jest.fn(),
      subscribe: jest.fn()
    }
    jsonrpc = new JsonRpcChannel({ channel })
  })

  it('can create a connect url', () => {
    const baseUrl = 'https://example.com'
    const url = 'https://example.com#connect'
    channel.createConnectUrl.mockReturnValue(url)

    const connectUrl = jsonrpc.createConnectUrl(baseUrl)

    expect(channel.createConnectUrl.mock.calls[0][0]).toEqual(baseUrl)
    expect(connectUrl).toEqual(url)
  })

  it('exposes id of the underlying secure channel', () => {
    const id = 'channel id'
    channel.id = id

    jsonrpc = new JsonRpcChannel({ channel: channel })
    expect(jsonrpc.id).toEqual(id)
  })

  it('exposes the key of the underlying secure channel', () => {
    const key = 'channel key'
    channel.key = key

    jsonrpc = new JsonRpcChannel({ channel: channel })
    expect(jsonrpc.key).toEqual(key)
  })

  it('exposes the appName of the underlying secure channel', () => {
    const appName = 'App Name'
    channel.appName = appName

    jsonrpc = new JsonRpcChannel({ channel: channel })
    expect(jsonrpc.appName).toEqual(appName)
  })

  describe('message subscriptions', () => {
    const message = { jsonrpc: '2.0', method: 'test' }
    const invalidVersionMessage = { jsonrpc: '0.42', method: 'test' }
    const messageWithId = { jsonrpc: '2.0', id: 1, method: 'test' }
    const messageWithoutMethod = { jsonrpc: '2.0' }

    describe('outgoing', () => {
      it('hands valid message over to secure channel', async () => {
        jsonrpc.emit(message)
        expect(channel.emit.mock.calls[0][0]).toEqual(
          JSON.stringify(message)
        )
      })

      it('throws when message is not in a json rpc 2.0 format', () => {
        const expectedError = new Error('request is not a JSON-RPC 2.0 object')
        expect(() =>
          jsonrpc.emit(invalidVersionMessage)
        ).toThrow(expectedError)
      })

      it('throws when message has an id', () => {
        const expectedError = new Error('JSON-RPC message may not have an "id" property')
        expect(() =>
          jsonrpc.emit(messageWithId)
        ).toThrow(expectedError)
      })

      it('throws when message does not specify a method', () => {
        const expectedError = new Error('JSON-RPC request is missing a "method" property')
        expect(() =>
          jsonrpc.emit(messageWithoutMethod)
        ).toThrow(expectedError)
      })
    })

    describe('incoming', () => {
      let onMessage
      let channelOnMessageHandler

      beforeEach(async () => {
        onMessage = jest.fn()
        await jsonrpc.subscribe(onMessage)
        channelOnMessageHandler = channel.subscribe.mock.calls[0][0]
      })

      it('passes incoming messages on', () => {
        channelOnMessageHandler(JSON.stringify(message))
        expect(onMessage).toBeCalledWith(message)
      })

      it('ignores messages that are not in json rpc 2.0 format', () => {
        const wrongMessage = JSON.stringify(invalidVersionMessage)
        channelOnMessageHandler(wrongMessage)
        expect(onMessage).not.toBeCalled()
      })

      it('ignores messages with an id', () => {
        const wrongMessage = JSON.stringify(messageWithId)
        channelOnMessageHandler(wrongMessage)
        expect(onMessage).not.toBeCalled()
      })

      it('ignores messages without method', () => {
        const wrongMessage = JSON.stringify(messageWithoutMethod)
        channelOnMessageHandler(wrongMessage)
        expect(onMessage).not.toBeCalled()
      })
    })
  })
})
