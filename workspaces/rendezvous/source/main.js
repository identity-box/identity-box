import { EntryPoint } from './entry-point'
import commander from 'commander'
import packageJSON from '../package.json'

const program = new commander.Command()

const start = cmdObj => {
  const { baseUrl, servicePath, port } = cmdObj
  console.log(`@identity-box/rendezvous@${packageJSON.version}`)
  console.log('servicePath=', servicePath)
  console.log('baseUrl=', baseUrl)
  console.log('port=', port)
  const entryPoint = new EntryPoint({
    servicePath,
    baseUrl,
    port
  })
  entryPoint.start()
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
    .option('-s, --servicePath <path>', 'service path where to forward messages', 'identity-box.box-office')
    .option('-p, --port <number>', 'port on which to listen to http requests', 3100)
    .requiredOption('-b, --baseUrl <url>', 'service url')
    .action(start)

  await program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.help()
  }
}

export { main }
