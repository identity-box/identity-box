import createServer from './source/server'

const server = createServer()

let port = 3000

if (process.argv.length === 4 && (process.argv[2] === '--port' || process.argv[2] === '--p')) {
  const p = Number(process.argv[3])
  port = isNaN(p) ? 3000 : p
}

server.listen(port, function () {
  console.log(`IdBox Queueing Service running on port ${port}`)
})
