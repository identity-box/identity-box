#!/bin/sh 
":" //# http://sambal.org/?p=1014 ; exec /usr/bin/env node -r esm "$0" "$@"

/**
 * This is a convenience file that allows you to run the service in esm mode - so
 * without babel transpilation in between
 */

import { main } from './source/main'

main()
