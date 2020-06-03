import { EntryPoint } from './entry-point'
import commander from 'commander'
import packageJSON from '../package.json'

const program = new commander.Command()

const start = cmdObj => {
  const { queuingServiceUrl, telepathLinkBaseUrl } = cmdObj
  console.log('queuingServiceUrl=', queuingServiceUrl)
  console.log('telepathLinkBaseUrl=', telepathLinkBaseUrl)
  const entryPoint = new EntryPoint({
    queuingServiceUrl,
    telepathLinkBaseUrl
  })
  entryPoint.start()
  process.on('SIGINT', () => {
    console.log('stopping...')
    entryPoint.stop()
    console.log('stopped. exiting now...')
    process.exit(0)
  })
  process.stdin.resume()
}

const main = async () => {
  program
    .version(`${packageJSON.version}`)
    .usage('command [options]')
    .on('command:*', () => {
      console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
      process.exit(1)
    })

  program.command('start')
    .option('-q, --queuingServiceUrl <url>', 'url of the queuing service (including port if necessary)', 'https://idbox-queue.now.sh')
    .option('-b, --telepathLinkBaseUrl <url>', 'base url for the telepath link', 'https://idbox.online')
    .action(start)

  await program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.help()
  }
}

export { main }
