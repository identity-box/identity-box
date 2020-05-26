import got from 'got'
import commander from 'commander'

const program = new commander.Command()

const sendCommand = async cmd => {
  try {
    const json = await got('http://localhost:3100/', {
      method: 'POST',
      json: cmd,
      timeout: 25000
    }).json()
    console.log(json)
    return 0
  } catch (e) {
    console.log(e.message)
    return 1
  }
}

const publish = async cmdObj => {
  const { ipns, cid } = cmdObj
  const cmd = {
    method: 'publish-name',
    ipnsName: ipns,
    cid
  }
  process.exit(await sendCommand(cmd))
}

const unpublish = async cmdObj => {
  const { ipns } = cmdObj
  const cmd = {
    method: 'unpublish-name',
    ipnsName: ipns
  }
  process.exit(await sendCommand(cmd))
}

const resolve = async cmdObj => {
  const { ipns } = cmdObj
  const cmd = {
    method: 'resolve-name',
    ipnsName: ipns
  }
  process.exit(await sendCommand(cmd))
}

async function main () {
  program
    .version('0.1.0')
    .usage('command [options]')
    .on('command:*', () => {
      console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
      process.exit(1)
    })

  program.command('publish')
    .requiredOption('--ipns <name>', 'IPNS name to publish')
    .requiredOption('--cid <cid>', 'CID to publish.')
    .action(publish)

  program.command('unpublish')
    .requiredOption('--ipns <name>', 'IPNS name to unpublish')
    .action(unpublish)

  program.command('resolve')
    .requiredOption('--ipns <name>', 'IPNS name to resolve')
    .action(resolve)

  await program.parse(process.argv)

  if (!process.argv.slice(2).length) {
    program.help()
  }
}

main()
