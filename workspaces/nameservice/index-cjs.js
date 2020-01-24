#!/usr/bin/env node

import { NameService } from './src/entry-point'
import { Server } from './src/server'

const nameservice = new NameService()
const server = new Server(nameservice)

server.start()
