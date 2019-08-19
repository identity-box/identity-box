import createServer from './source/server'
import { buildArgv } from 'jest-cli/build/cli'

const server = createServer()

let port = 3000

if (buildArgv.length === 4 && (process.argv[2] === '--port' || process.argv[2] === '--p')) {
  const p = Number(process.argv[3])
  port = isNaN(p) ? 3000 : p
}

server.listen(port, function () {
  console.log(`IdBox Queueing Service running on port ${port}`)
})
