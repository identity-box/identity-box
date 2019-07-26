import React from 'react'
import { Main } from 'src/views/main'
import { YellowBox } from 'react-native'
import { Buffer } from 'buffer/'

YellowBox.ignoreWarnings([
  'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
])

window.Buffer = Buffer

const App = () => (
  <Main />
)

export default App
