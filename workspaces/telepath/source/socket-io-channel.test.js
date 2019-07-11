import base64url from 'base64url'

import { SocketIOChannel } from './socket-io-channel'

class ServerError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ServerError'
    this.message = message
  }

  toJSON () {
    return {
      error: {
        name: this.name,
        message: this.message
      }
    }
  }
}

describe('SocketIOChannel', () => {
  let socketStub
  let service
  let handlers
  let identifyTimesOut
  let onMessage
  let onError
  const channelId = 'channelId'
  const clientId = 'clientId'

  beforeEach(() => {
    onMessage = jest.fn()
    onError = jest.fn()
    identifyTimesOut = false
    handlers = []
    socketStub = {
      connect: jest.fn().mockImplementation(function () {
        const onConnect = handlers['connect']
        if (onConnect) {
          setTimeout(() => onConnect(), 1)
        }
      }),
      on: jest.fn().mockImplementation(function (event, cb) {
        handlers[event] = cb
      }),
      off: jest.fn(),
      emit: jest.fn().mockImplementation(function (event, payload, ack) {
        if (ack && !identifyTimesOut) {
          if (this.serverError) {
            setTimeout(() => {
              ack(this.serverError.toJSON())
              this.serverError = null
            }, 1)
          } else {
            setTimeout(() => ack(true), 1)
          }
        }
      })
    }
    socketStub.connected = false
    service = new SocketIOChannel({
      clientId,
      socketFactoryMethod: () => socketStub
    })
  })

  it('does send the message before the connection is established', async () => {
    await service.emit(Buffer.from([1, 2, 3]))
    expect(socketStub.emit.mock.calls.length).toBe(0)
  })

  it('throws when identify times out', async () => {
    identifyTimesOut = true
    await expect(
      service.start({
        channelId: '',
        onMessage,
        onError,
        timeout: 100
      })
    ).rejects.toThrow()
  })

  describe('when sending messages before setup is done', () => {
    beforeEach(() => {
      socketStub.on = jest.fn()
      let data = Buffer.from([1, 2, 3, 4])
      service.emit(data)
    })

    it('records message as pending and does not send yet', () => {
      expect(service.pendingMessages.length).toBe(1)
    })
  })

  describe('when started with an unconnected socket', () => {
    beforeEach(async () => {
      await service.start({
        channelId,
        onMessage,
        onError
      })
    })

    it('installs all the handler', () => {
      expect(service.socket).toBe(socketStub)
      expect(socketStub.connect.mock.calls.length).toBe(1)
      expect(socketStub.on.mock.calls[0][0]).toBe('connect')
      expect(socketStub.on.mock.calls[1][0]).toBe('message')
      expect(socketStub.on.mock.calls[2][0]).toBe('error')
    })

    it('it identifies itself when socket connects', () => {
      const onConnectCallback = socketStub.on.mock.calls[0][1]
      onConnectCallback()
      expect(socketStub.emit.mock.calls[0][0]).toBe('identify')
      expect(socketStub.emit.mock.calls[0][1]).toEqual({ channelId, clientId })
    })

    describe('when setup is finished', () => {
      beforeEach(() => {
        socketStub.emit.mockClear()
      })

      it('can send messages', async () => {
        const data = Buffer.from([1, 2, 3, 4])
        await service.emit(data)
        expect(socketStub.emit.mock.calls[0][0]).toBe('message')
        const encodedData = base64url.encode(data)
        expect(socketStub.emit.mock.calls[0][1]).toBe(encodedData)
      })

      it('sends pending messages after connection is established', async () => {
        service.pendingMessages = [Buffer.from([1, 2, 3, 4])]
        await service.start({ channelId, onMessage, onError })
        expect(service.pendingMessages.length).toBe(0)
        expect(socketStub.emit.mock.calls[1][0]).toBe('message')
      })

      it('throws an error if one of the pending message cannot be delivered to the server', async () => {
        service.pendingMessages = [Buffer.from([1, 2, 3, 4])]
        const error = 'some error'
        socketStub.serverError = new ServerError(error)
        await expect(service.start({ channelId, onMessage, onError })).rejects.toThrow(new Error(error))
      })

      it('base64url decodes incoming messages', () => {
        const registeredMessasgeHandler = socketStub.on.mock.calls[1][1]
        const message = Buffer.from('a message')
        const encodedMessage = base64url.encode(message)
        registeredMessasgeHandler(encodedMessage)
        expect(onMessage.mock.calls[0][0]).toEqual(message)
      })

      it('passes socket level errors on to the provided error handler', () => {
        const error = 'some error'
        handlers['error'](error)
        expect(onError.mock.calls[0][0]).toBe(error)
      })

      it('throws an error if server sends negative ack', async () => {
        socketStub.serverError = new ServerError('some error')
        const data = Buffer.from([1, 2, 3, 4])
        await expect(service.emit(data)).rejects.toThrow(new Error('some error'))
      })
    })
  })

  describe('when started with a connected socket', () => {
    beforeEach(async () => {
      socketStub.connected = true
      await service.start({
        channelId,
        onMessage,
        onError
      })
    })

    it('does not try to connect again', () => {
      expect(socketStub.connect.mock.calls.length).toBe(0)
    })

    it('removes old event handlers', () => {
      expect(socketStub.off.mock.calls.length).toBe(1)
    })

    it('identifies itself', () => {
      expect(socketStub.emit.mock.calls[0][0]).toBe('identify')
      expect(socketStub.emit.mock.calls[0][1]).toEqual({ channelId, clientId })
    })
  })
})
