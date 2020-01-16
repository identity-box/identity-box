// run it with node -r esm test.js
// it should list the keys on your ipfs node

import ipfsClient from 'ipfs-http-client'

const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

ipfs.key.list().then(keys => {
  console.log(keys)
})

process.stdin.resume()
