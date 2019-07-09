#!/usr/bin/env node -r esm

import { idservice } from './src/entry-point'

idservice().catch(reason => {
  console.error(reason.toString())
  if (reason.toString() === 'Error: No CID argument provided!') {
    return
  }
  process.exit(1)
})

process.stdin.resume()
