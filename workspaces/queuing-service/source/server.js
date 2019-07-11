import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
import { IOSocketServer } from './socket-server'

let ioSocketServer

function createServer () {
  const app = express()
  const httpServer = http.Server(app)
  const io = socketIO(httpServer, { serveClient: false })
  ioSocketServer = new IOSocketServer(io)
  ioSocketServer.setVerbose(process.env.NODE_ENV === 'development')
  ioSocketServer.start()

  return httpServer
}

export default createServer
