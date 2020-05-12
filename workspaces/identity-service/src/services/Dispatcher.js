import ipfsClient from 'ipfs-http-client'

class Dispatcher {
  ipfs = ipfsClient(process.env.IPFS_ADDR || '/ip4/127.0.0.1/tcp/5001')

  dispatch = message => {
    console.log('**!!** DISPATCHER **!!**')
    console.log('received:')
    console.log('message:', message)
    switch (message.method) {
      default:
        return {
          method: 'unknown-method',
          params: []
        }
    }
  }
}

export { Dispatcher }
