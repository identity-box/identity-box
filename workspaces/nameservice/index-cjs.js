#!/usr/bin/env node

import { NameService } from './src/entry-point'

const nameservice = new NameService()

nameservice.start()
