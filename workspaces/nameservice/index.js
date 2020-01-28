#!/bin/sh
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node -r esm "$0" "$@"

import { NameService } from './src/entry-point'
import { Server } from './src/server'

const nameservice = new NameService()
const server = new Server(nameservice)

server.start()
