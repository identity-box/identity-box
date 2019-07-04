import fs from 'fs'
import base64url from 'base64url'
import { Buffers } from '@react-frontend-developer/buffers'

const readConfiguration = path => {
  if (!fs.existsSync(path)) {
    return undefined
  }
  const telepathConfigurationString = fs.readFileSync(path, 'UTF-8')
  const [channelId, keyBase64, appNameBase64, connectUrlBase64] = telepathConfigurationString.split(' ')

  const telepathConfiguration = {
    channelId,
    channelKey: Buffers.copyToUint8Array(base64url.toBuffer(keyBase64)),
    appName: base64url.decode(appNameBase64),
    connectUrl: base64url.decode(connectUrlBase64)
  }
  return telepathConfiguration
}

export { readConfiguration }
