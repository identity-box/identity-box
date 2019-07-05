import { start } from './src/entry-point'

start().catch(reason => {
  console.error(reason.toString())
  if (reason.toString() === 'Error: No CID argument provided!') {
    return
  }
  process.exit(1)
})

process.stdin.resume()
