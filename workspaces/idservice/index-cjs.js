#!/usr/bin/env node

import { idservice } from './src/entry-point/index-cjs'

idservice().catch(reason => {
  console.error(reason.toString())
  if (reason.toString() === 'Error: No CID argument provided!') {
    return
  }
  process.exit(1)
})

process.stdin.resume()
