import React from 'react'
import { AppearanceProvider } from 'react-native-appearance'
import { Main } from 'src/views/main'
import { LogBox } from 'react-native'
import { Buffer } from 'buffer/'

LogBox.ignoreLogs([
  'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?',
  'Calling `getNode()` on the ref of an Animated component is no longer necessary. You can now directly use the ref instead. This method will be removed in a future release.'
])

window.Buffer = Buffer

const App = () => (
  <AppearanceProvider>
    <Main />
  </AppearanceProvider>
)

export default App
