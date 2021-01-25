import { execSync } from 'child_process'
import commander from 'commander'
import packageJSON from '../package.json'

const runCommand = command => {
  execSync(command, { stdio: 'inherit' })
}

const run = program => {
  const name = packageJSON.name
  runCommand('yarn build')
  runCommand('cp ../../yarn.lock .')
  runCommand(`tar czvf ${name}.tar.gz .next ecosystem.config.js package.json`)
  runCommand(`scp -i "${program.deployKey}" "${name}.tar.gz" "${program.deployUrl}:~/idbox/${name}"`)
  runCommand(`ssh -i "${program.deployKey}" "${program.deployUrl}" bash -c "~/idbox/${name}/deploy.sh"`)
  runCommand('rm associate.tar.gz yarn.lock')
}

const deploy = async () => {
  const program = new commander.Command()
  program
    .version(`${packageJSON.version}`)
    .requiredOption('-k, --deploy-key <key>', 'path to the deployment SSH key file (.pem)')
    .requiredOption('-u, --deploy-url <url>', 'deployment url including user name (username@...)')

  await program.parse(process.argv)

  run(program)
}

export { deploy }
