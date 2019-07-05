import { start } from './src/entry-point'

start().catch(reason => {
  console.error(reason.toString())
  process.exit(1)
})

process.stdin.resume()
