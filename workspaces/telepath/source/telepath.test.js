import base64url from 'base64url'
import nacl from 'tweetnacl'
import { TypedArrays } from '@react-frontend-developer/buffers'
import { JsonRpcChannel } from './json-rpc-channel'
import { Telepath } from './telepath'
import { SocketIOChannel } from './socket-io-channel'

jest.mock('./socket-io-channel')

describe('Telepath', () => {
  const appName = 'some app name'
  let telepath
  let socketIOChannel

  beforeEach(() => {
    SocketIOChannel.mockClear()
    telepath = new Telepath('https://queuing.example.com')
    socketIOChannel = {
      start: jest.fn(function ({ onMessage, onError }) {
        this.onMessage = onMessage
        this.onError = onError
      })
    }
    SocketIOChannel.mockImplementation(socket => {
      return socketIOChannel
    })
  })

  describe('when creating a new channel', () => {
    let channel

    beforeEach(() => {
      channel = telepath.createChannel({ appName })
    })

    it('returns a JSON-RPC channel', () => {
      expect(channel).toBeInstanceOf(JsonRpcChannel)
    })

    it('uses the socket from the socket manager', () => {
      expect(SocketIOChannel).toHaveBeenCalledTimes(1)
      expect(channel.channel.socketIOChannel).toEqual(socketIOChannel)
    })

    it('has a random id', () => {
      expect(channel.channel.id).toBeDefined()
      expect(base64url.toBuffer(channel.channel.id).length).toBe(18)
    })

    it('has a random key', () => {
      expect(channel.channel.key).toBeDefined()
      expect(channel.channel.key.length).toBe(nacl.secretbox.keyLength)
    })

    it('can create a channel with given id and key params', () => {
      const id = base64url.encode([1, 2, 3])
      const key = [4, 5, 6]
      channel = telepath.createChannel({ id, key, appName })

      expect(channel.channel.id).toEqual(id)
      expect(channel.channel.key).toEqual(key)
      expect(channel.channel.appName).toEqual(appName)
    })

    it('throws when no app name is given', () => {
      const id = base64url.encode([1, 2, 3])
      const key = [4, 5, 6]
      expect.assertions(1)
      const expectedError = new Error('appName is a required parameter')
      expect(() => telepath.createChannel({ id, key })).toThrow(expectedError)
    })

    describe('message subscriptions', () => {
      const message = { jsonrpc: '2.0', method: 'test' }
      const error = new Error('some error')
      let onMessage
      let onError
      let subscription

      const enc = message => {
        const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
        const cypherText = nacl.secretbox(
          TypedArrays.string2Uint8Array(message, 'utf8'),
          nonce,
          channel.key
        )
        return Buffer.concat([nonce, cypherText])
      }

      beforeEach(async () => {
        onMessage = jest.fn()
        onError = jest.fn()
        subscription = await channel.subscribe(onMessage, onError)
      })

      it('can subscribe for messages', () => {
        socketIOChannel.onMessage(enc(JSON.stringify(message)))
        expect(onMessage).toHaveBeenCalledWith(message)
      })

      it('can also receives errors', () => {
        socketIOChannel.onError(error)
        expect(onError).toHaveBeenCalledWith(error)
      })

      it('can unsubscribe', () => {
        channel.unsubscribe(subscription)
        socketIOChannel.onMessage(enc(JSON.stringify(message)))
        expect(onMessage).not.toHaveBeenCalled()
        socketIOChannel.onError(error)
        expect(onError).not.toHaveBeenCalled()
      })
    })
  })
})
