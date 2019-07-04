import fs from 'fs'
import base64url from 'base64url'

const writeConfiguration = ({ configuration, path }) => {
  const { id, key, appName, connectUrl } = configuration
  const configurationString = `${id} ${base64url.encode(key)} ${base64url.encode(appName)} ${base64url.encode(connectUrl)}`

  fs.writeFileSync(path, configurationString)
}

export { writeConfiguration }
