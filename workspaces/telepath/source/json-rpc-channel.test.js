import { JsonRpcChannel } from './json-rpc-channel'

describe('JSON RPC Channel', () => {
  let jsonrpc
  let channel

  beforeEach(() => {
    channel = {
      notify: jest.fn(),
      createConnectUrl: jest.fn(),
      startNotifications: jest.fn()
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

  describe('notifications', () => {
    const notification = { jsonrpc: '2.0', method: 'test' }
    const invalidVersionNotification = { jsonrpc: '0.42', method: 'test' }
    const notificationWithId = { jsonrpc: '2.0', id: 1, method: 'test' }
    const notificationWithoutMethod = { jsonrpc: '2.0' }

    describe('outgoing', () => {
      it('hands valid notification over to secure channel', async () => {
        await jsonrpc.notify(notification)
        expect(channel.notify.mock.calls[0][0]).toEqual(
          JSON.stringify(notification)
        )
      })

      it('throws when notification is not a json rpc 2.0 structure', async () => {
        await expect(
          jsonrpc.notify(invalidVersionNotification)
        ).rejects.toThrow()
      })

      it('throws when notification has an id', async () => {
        await expect(jsonrpc.notify(notificationWithId)).rejects.toThrow()
      })

      it('throws when notification does not specify a method', async () => {
        await expect(
          jsonrpc.notify(notificationWithoutMethod)
        ).rejects.toThrow()
      })
    })

    describe('incoming', () => {
      let notificationHandler
      let channelNotificationHandler

      beforeEach(async () => {
        notificationHandler = jest.fn()
        await jsonrpc.startNotifications()
        jsonrpc.subscribeForNotifications(notificationHandler)
        channelNotificationHandler = channel.startNotifications.mock.calls[0][0]
      })

      it('passes incoming notifications on', () => {
        channelNotificationHandler(JSON.stringify(notification))
        expect(notificationHandler).toBeCalledWith(notification)
      })

      it('ignores notification that is not a json rpc 2.0 structure', () => {
        const wrongMessage = JSON.stringify(invalidVersionNotification)
        channelNotificationHandler(wrongMessage)
        expect(notificationHandler).not.toBeCalled()
      })

      it('ignores notification that has an id', () => {
        const wrongMessage = JSON.stringify(notificationWithId)
        channelNotificationHandler(wrongMessage)
        expect(notificationHandler).not.toBeCalled()
      })

      it('ignores notification without method', () => {
        const wrongMessage = JSON.stringify(notificationWithoutMethod)
        channelNotificationHandler(wrongMessage)
        expect(notificationHandler).not.toBeCalled()
      })
    })
  })
})
