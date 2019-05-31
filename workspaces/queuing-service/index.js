import createServer from './source/server'

const server = createServer()

server.listen(3000, function () {
  console.log('IdBox Queueing Service running on port 3000')
})
