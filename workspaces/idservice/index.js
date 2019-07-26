#!/bin/sh 
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node -r esm "$0" "$@"

import { IdService } from './src/entry-point'

const idservice = new IdService()

idservice.start().catch(reason => {
  console.error(reason.toString())
  process.exit(1)
})

process.stdin.resume()
