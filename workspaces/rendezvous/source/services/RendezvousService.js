import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
import { IOSocketServer } from './IOSocketServer'

class RendezvousService {
  app
  httpServer
  ioSocketServer
  dispatcher

  start = () => {
    this.app = express()
    this.httpServer = http.Server(this.app)
    const io = socketIO(this.httpServer, { serveClient: false })
    this.ioSocketServer = new IOSocketServer(io, this.dispatcher)
    this.ioSocketServer.start()

    this.app.get('/', function (req, res) {
      res.send('Hello World!')
    })

    return this.httpServer
  }

  constructor ({
    baseUrl,
    dispatcher
  }) {
    this.baseUrl = baseUrl
    this.dispatcher = dispatcher
  }

  static create = ({
    baseUrl,
    dispatcher
  }) => {
    if (!dispatcher) {
      throw new Error("Can't do anything without Dispatcher instance!")
    }
    const server = new RendezvousService({
      baseUrl,
      dispatcher
    })

    return server.start()
  }
}

export { RendezvousService }
