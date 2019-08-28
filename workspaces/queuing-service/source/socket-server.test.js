import {
  IOSocketServer,
  SocketServer,
  maximumQueueSize,
  maximumMessagesLength
} from './socket-server'
import FakeClientSocket from './fake-client'
import MockDate from 'mockdate'

import { ServerError } from './server-error'

jest.useFakeTimers()

describe('socket server', () => {
  const queue = 'queue'
  const senderClientId = 'senderClientId'
  const receiverClientId = 'receiverClientId'
  const message = 'some message'
  let socketServer
  let sender
  let senderIdentityAck
  let senderMessageAck
  let receiver
  let receiverIdentityAck
  let receiverMessageAck

  beforeEach(() => {
    socketServer = new SocketServer()
    senderIdentityAck = jest.fn()
    senderMessageAck = jest.fn()
    receiverIdentityAck = jest.fn()
    receiverMessageAck = jest.fn()
    sender = new FakeClientSocket()
    receiver = new FakeClientSocket()
  })

  describe('when sender is connected', () => {
    beforeEach(() => {
      sender.connect(socketServer)
      sender.receiveIncoming('identify', { channelId: queue, clientId: senderClientId }, senderIdentityAck)
    })

    it('is removed from registry when it disconnects', () => {
      expect(socketServer.clients[queue].length).toBe(1)
      sender.receiveIncoming('disconnect')
      expect(Object.keys(socketServer.clients).length).toBe(0)
    })

    it('does not receive its own pending messages', () => {
      sender.receiveIncoming('message', message, senderMessageAck)
      sender.receiveIncoming('identify', { channelId: queue, clientId: senderClientId }, senderIdentityAck)
      expect(sender.outgoing.length).toBe(0)
    })

    it('sender and receiver get the right messages', () => {
      const messageRcv = 'message from receiver'
      sender.receiveIncoming('message', message, senderMessageAck)
      sender.receiveIncoming('disconnect')
      receiver.connect(socketServer)
      receiver.receiveIncoming('identify', { channelId: queue, clientId: receiverClientId }, receiverIdentityAck)
      receiver.receiveIncoming('message', messageRcv, receiverIdentityAck)
      expect(receiver.outgoing.length).toBe(1)
      expect(receiver.outgoing[0].payload).toBe(message)
      receiver.receiveIncoming('disconnect')
      sender.connect(socketServer)
      sender.receiveIncoming('identify', { channelId: queue, clientId: senderClientId }, senderIdentityAck)
      expect(sender.outgoing.length).toBe(1)
      expect(sender.outgoing[0].payload).toBe(messageRcv)
    })

    describe('identity acknowledge', () => {
      it('acknowledges the identify message', () => {
        expect(senderIdentityAck).toBeCalled()
      })

      it('acknowledges the identity message **before** sending pending messages', () => {
        receiver = new FakeClientSocket()
        const ackRcv = jest.fn(() => {
          expect(receiver.outgoing.length).toBe(0)
        })
        const messageAck = jest.fn()
        sender.receiveIncoming('message', message, messageAck)
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', { channelId: queue, clientId: receiverClientId }, ackRcv)
        expect(receiver.outgoing.length).toBe(1)
        expect(receiver.outgoing[0].payload).toBe(message)
      })

      it('sender identity ack function is called with value "true" if successful', () => {
        expect(senderIdentityAck).toHaveBeenCalledTimes(1)
        expect(senderIdentityAck).toHaveBeenCalledWith(true)
      })

      it('sender message ack function is called with value "true" if successful', () => {
        const messageAck = jest.fn()
        sender.receiveIncoming('message', message, messageAck)

        expect(messageAck).toHaveBeenCalledTimes(1)
        expect(messageAck).toHaveBeenCalledWith(true)
      })
    })

    describe('when receiver is connected', () => {
      beforeEach(() => {
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', { channelId: queue, clientId: receiverClientId }, receiverIdentityAck)
      })

      it('receives message that has been sent', () => {
        sender.receiveIncoming('message', message, senderMessageAck)
        expect(receiver.outgoing[0].payload).toBe(message)
      })

      it('allows max 2 parties per queue id', () => {
        const receiver2 = new FakeClientSocket()
        receiver2.connect(socketServer)
        const receiver2Ack = jest.fn()
        receiver2.receiveIncoming('identify', { channelId: queue, clientId: 'some new clientId' }, receiver2Ack)
        expect(receiver2Ack).toHaveBeenCalledTimes(1)
        const error = receiver2Ack.mock.calls[0][0]
        expect(error.toJSON()).toEqual({
          error: {
            message: 'too many clients for queue',
            name: 'ServerError'
          }
        })
      })

      it('accepts a new connection from the same client', () => {
        const receiver2 = new FakeClientSocket()
        receiver2.connect(socketServer)
        const receiver2Ack = jest.fn()
        receiver2.receiveIncoming('identify', { channelId: queue, clientId: receiverClientId }, receiver2Ack)
        expect(receiver2Ack).toHaveBeenCalledTimes(1)
        expect(receiver2Ack).toHaveBeenCalledWith(true)
      })

      it('is removed from registry when it disconnects', () => {
        expect(socketServer.clients[queue].length).toBe(2)
        receiver.receiveIncoming('disconnect')
        expect(Object.keys(socketServer.clients).length).toBe(1)
        expect(socketServer.clients[queue].length).toBe(1)
      })
    })

    describe('when receiver is connected for different queue', () => {
      beforeEach(() => {
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', { channelId: 'different queue', clientId: receiverClientId }, receiverIdentityAck)
      })

      it('receives nothing', () => {
        sender.receiveIncoming('message', message, receiverMessageAck)
        expect(receiver.outgoing.length).toBe(0)
      })
    })

    describe('when receiver connects after sending', () => {
      let senderMessageAck
      let receiver
      let receiverIdentifyAck
      const message2 = 'some second message'

      beforeEach(() => {
        senderMessageAck = jest.fn()
        receiverIdentifyAck = jest.fn()
        sender.receiveIncoming('message', message, senderMessageAck)
        sender.receiveIncoming('message', message2, senderMessageAck)
      })

      it('receives after connecting', () => {
        receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', { channelId: queue, clientId: receiverClientId }, receiverIdentifyAck)
        expect(receiver.outgoing[0].payload).toBe(message)
        expect(receiver.outgoing[1].payload).toBe(message2)
      })
    })

    it(`allows a maximum of ${maximumQueueSize} messages in a queue`, () => {
      ;[...Array(maximumQueueSize).keys()].forEach(i => {
        sender.receiveIncoming('message', message, senderMessageAck)
      })
      expect(senderMessageAck).toHaveBeenCalledTimes(maximumQueueSize)
      ;[...Array(maximumQueueSize).keys()].forEach(i => {
        expect(senderMessageAck).toHaveBeenNthCalledWith(i + 1, true)
      })

      const error = new ServerError('too many pending messagess')

      sender.receiveIncoming('message', message, senderMessageAck)
      expect(senderMessageAck).toHaveBeenNthCalledWith(maximumQueueSize + 1, error)
    })

    it(`allows a maximum size of ${maximumMessagesLength} per message`, () => {
      const notTooBig = Array(maximumMessagesLength).fill('a')
      const tooBig = notTooBig + 'a'
      sender.receiveIncoming('message', notTooBig, senderMessageAck)
      expect(senderMessageAck).toHaveBeenCalledTimes(1)
      expect(senderMessageAck).toHaveBeenNthCalledWith(1, true)
      sender.receiveIncoming('message', tooBig, senderMessageAck)
      const error = new ServerError('message corrupted or too long')
      expect(senderMessageAck).toHaveBeenCalledTimes(2)
      expect(senderMessageAck).toHaveBeenNthCalledWith(2, error)
    })

    describe('time to live', () => {
      const startTime = Date.now()
      const tenMinutes = 10 * 60 * 1000
      let receiverIdentifyAck

      beforeEach(() => {
        receiverIdentifyAck = jest.fn()
        MockDate.set(startTime)
        sender.receiveIncoming('message', message, senderMessageAck)
      })

      afterEach(() => {
        MockDate.reset()
      })

      const forwardTime = newTime => {
        MockDate.set(new Date(newTime))
        jest.runOnlyPendingTimers()
      }

      it('retains queues for 10 minutes', () => {
        forwardTime(startTime + tenMinutes)
        const receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', { channelId: queue, clientId: receiverClientId }, receiverIdentifyAck)
        expect(receiver.outgoing[0].payload).toBe(message)
      })

      it('purges queues after 10 minutes', () => {
        forwardTime(startTime + tenMinutes + 1)
        const receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', { channelId: queue, clientId: receiverClientId }, receiverIdentifyAck)
        expect(receiver.outgoing.length).toBe(0)
      })

      it('does not sent messages that has been purged because of timeouting', () => {
        sender.receiveIncoming('message', 'some other message', senderMessageAck)
        forwardTime(startTime + tenMinutes)
        let receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', { channelId: queue, clientId: receiverClientId }, receiverIdentifyAck)
        expect(receiver.outgoing[0].payload).toBe(message)
        expect(receiver.outgoing[1].payload).toBe('some other message')
        forwardTime(startTime + tenMinutes + 1)
        receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', { channelId: queue, clientId: receiverClientId }, receiverIdentifyAck)
        expect(receiver.outgoing.length).toBe(0)
      })
    })
  })
})

describe('IO Socket Server', () => {
  let io
  let server

  beforeEach(() => {
    io = { on: jest.fn() }
    server = new IOSocketServer(io)
  })

  it('registers a connection handler', () => {
    server.start()
    const event = io.on.mock.calls[0][0]
    expect(event).toBe('connection')
  })

  it('forwards connection events to the Socket Server', () => {
    server.socketServer = { onConnection: jest.fn() }
    server.start()
    const callback = io.on.mock.calls[0][1]
    const socket = 'some socket'
    callback(socket)
    expect(server.socketServer.onConnection).toBeCalledWith(socket)
  })
})
