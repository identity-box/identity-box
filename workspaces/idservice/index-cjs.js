#!/usr/bin/env node

import { IdService } from './src/entry-point'

const idservice = new IdService()

idservice.start().catch(reason => {
  console.error(reason.toString())
  process.exit(1)
})

process.stdin.resume()
