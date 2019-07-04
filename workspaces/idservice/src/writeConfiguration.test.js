import { writeConfiguration } from './writeConfiguration'
import fs from 'fs'
import base64url from 'base64url'

jest.mock('fs')

const examplePath = 'path-to-telepath-configuration'
const id = 'fJK-eE00xRj1d1ymOjgqXTJc'
const key = 'zEGXHN9MhNjEWU1xTacF-MudYAN5Xxs7rRAI2ENxDtY'
const appName = 'IdBox-1'
const connectUrl = 'https://cogito.mobi/telepath/connect#I=CAKvRMLxnLghND5EWj1tn3Ei&E=9JXuumVmlDQyIbqZFPrG6Kuc-5PFFOs8hdyrHLQxuBY&A=SWRCb3gtMQ'

test('writing configuration to a file', () => {
  const configuration = {
    id,
    key: base64url.toBuffer(key),
    appName,
    connectUrl
  }
  writeConfiguration({ configuration, path: examplePath })

  fs.writeFileSync.mock.calls[0][0] = examplePath
  fs.writeFileSync.mock.calls[0][1] = `${id} ${key} ${base64url.encode(appName)} ${base64url.encode(connectUrl)}`
})
