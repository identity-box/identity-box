import IOSocketServer, {
  SocketServer,
  maximumQueueSize,
  maximumNotificationLength
} from './socket-server'
import FakeClientSocket from './fake-client'
import MockDate from 'mockdate'

jest.useFakeTimers()

describe('socket server', () => {
  let socketServer

  beforeEach(() => {
    socketServer = new SocketServer()
  })

  describe('when sender is connected', () => {
    const queue = 'queue'
    const notification = 'some notification'
    let sender

    beforeEach(() => {
      sender = new FakeClientSocket()
      sender.connect(socketServer)
      sender.receiveIncoming('identify', queue)
    })

    it('is removed from registry when it disconnects', () => {
      expect(socketServer.clients[queue].length).toBe(1)
      sender.receiveIncoming('disconnect')
      expect(Object.keys(socketServer.clients).length).toBe(0)
    })

    describe('when receiver is connected', () => {
      let receiver

      beforeEach(() => {
        receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', queue)
      })

      it('receives notification that has been sent', () => {
        sender.receiveIncoming('notification', notification)
        expect(receiver.outgoing[0].payload).toBe(notification)
      })

      it('acknowledges the identify message', () => {
        const ack = jest.fn()
        sender.receiveIncoming('identify', queue, ack)
        expect(ack).toBeCalled()
      })

      it('allows max 2 parties per queue id', () => {
        let receiver2 = new FakeClientSocket()
        receiver2.connect(socketServer)
        receiver2.receiveIncoming('identify', queue)
        expect(receiver2.outgoing[0].event).toBe('server error')
      })

      it('is removed from registry when it disconnects', () => {
        expect(socketServer.clients[queue].length).toBe(2)
        receiver.receiveIncoming('disconnect')
        expect(Object.keys(socketServer.clients).length).toBe(1)
        expect(socketServer.clients[queue].length).toBe(1)
      })
    })

    describe('when receiver is connected for different queue', () => {
      let receiver

      beforeEach(() => {
        receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', 'different queue')
      })

      it('receives nothing', () => {
        sender.receiveIncoming('notification', notification)
        expect(receiver.outgoing.length).toBe(0)
      })
    })

    describe('when receiver connects after sending', () => {
      let receiver
      const notification2 = 'some second notification'

      beforeEach(() => {
        sender.receiveIncoming('notification', notification)
        sender.receiveIncoming('notification', notification2)
      })

      it('receives after connecting', () => {
        receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', queue)
        expect(receiver.outgoing[0].payload).toBe(notification)
        expect(receiver.outgoing[1].payload).toBe(notification2)
      })
    })

    it(`allows a maximum of ${maximumQueueSize} notifications in a queue`, () => {
      for (let i = 0; i < maximumQueueSize; i++) {
        sender.receiveIncoming('notification', notification)
      }
      expect(sender.outgoing.length).toBe(0)
      sender.receiveIncoming('notification', notification)
      expect(sender.outgoing[0].event).toBe('server error')
    })

    it(`allows a maximum size of ${maximumNotificationLength} per notification`, () => {
      const notTooBig = Array(maximumNotificationLength + 1).join('a')
      const tooBig = notTooBig + 'a'
      sender.receiveIncoming('notification', notTooBig)
      expect(sender.outgoing.length).toBe(0)
      sender.receiveIncoming('notification', tooBig)
      expect(sender.outgoing[0].event).toBe('server error')
    })

    describe('time to live', () => {
      const startTime = Date.now()
      const tenMinutes = 10 * 60 * 1000

      beforeEach(() => {
        MockDate.set(startTime)
        sender.receiveIncoming('notification', notification)
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
        let receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', queue)
        expect(receiver.outgoing[0].payload).toBe(notification)
      })

      it('purges queues after 10 minutes', () => {
        forwardTime(startTime + tenMinutes + 1)
        let receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', queue)
        expect(receiver.outgoing.length).toBe(0)
      })

      it('retains queues that have been read recently', () => {
        sender.receiveIncoming('notification', 'some other notification')
        forwardTime(startTime + tenMinutes)
        let receiver = new FakeClientSocket()
        receiver.connect(socketServer)
        receiver.receiveIncoming('identify', queue)
        expect(receiver.outgoing[0].payload).toBe(notification)
        forwardTime(startTime + tenMinutes + 1)
        expect(receiver.outgoing[0].payload).toBe(notification)
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
