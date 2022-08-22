import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { IOSocketServer } from './IOSocketServer.js'
import packageJSON from '../../package.json' assert { type: 'json' }
class RendezvousService {
  baseUrl
  app
  httpServer
  ioSocketServer
  dispatcher

  start = () => {
    this.app = express()
    this.httpServer = createServer(this.app)
    const io = new Server(this.httpServer, {
      serveClient: false,
      cors: {
        origin: '*'
      }
    })
    this.ioSocketServer = new IOSocketServer(io, this.dispatcher)
    this.ioSocketServer.start()

    this.app.get('/', function (req, res) {
      res.send(`@identity-box/rendezvous@${packageJSON.version}`)
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
