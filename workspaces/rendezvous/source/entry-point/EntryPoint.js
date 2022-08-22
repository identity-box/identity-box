import { RendezvousService, Dispatcher } from '../services/index.js'
import qrcodeTerminal from 'qrcode-terminal'

class EntryPoint {
  rendezvousService
  baseUrl
  servicePath
  port

  constructor ({ baseUrl, servicePath, port }) {
    this.baseUrl = baseUrl
    this.servicePath = servicePath
    this.port = port
  }

  start = async () => {
    await qrcodeTerminal.generate(this.baseUrl, { small: true })
    const dispatcher = new Dispatcher({ servicePath: this.servicePath })
    this.rendezvousService = await RendezvousService.create({
      baseUrl: this.baseUrl,
      dispatcher
    })
    this.rendezvousService.listen(this.port, () => {
      console.log(`Rendezvous Service is listening on port ${this.port}`)
    })
  }
}

export { EntryPoint }
