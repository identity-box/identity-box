#!/bin/sh 
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node -r esm "$0" "$@"

import { idservice } from './src/entry-point'

idservice().catch(reason => {
  console.error(reason.toString())
  if (reason.toString() === 'Error: No CID argument provided!') {
    return
  }
  process.exit(1)
})

process.stdin.resume()
