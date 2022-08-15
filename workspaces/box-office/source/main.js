import { Command } from 'commander'

import { EntryPoint } from './entry-point/index.js'
import packageJSON from '../package.json' assert { type: 'json' }

const program = new Command()

const start = cmdObj => {
  const { servicePath } = cmdObj
  console.log(`@identity-box/box-office@${packageJSON.version}`)
  console.log('servicePath=', servicePath)
  const entryPoint = new EntryPoint({
    servicePath
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
    .option('-p, --servicePath <path>', 'service path for the service in the format:  service-namespace.service-id', 'identity-box.box-office')
    .action(start)

  await program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.help()
  }
}

export { main }
