import { Main } from 'src/views/main'
import { LogBox } from 'react-native'
import { Buffer } from 'buffer'

LogBox.ignoreLogs([
  'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?',
  'Calling `getNode()` on the ref of an Animated component is no longer necessary. You can now directly use the ref instead. This method will be removed in a future release.',
  'EventEmitter.removeListener(\'change\' ...): Method has been deprecated. Please instead use `remove()` on the subscription returned by `EventEmitter.addListener`.'
])

window.Buffer = Buffer

const App = () => (
  <Main />
)

export default App
