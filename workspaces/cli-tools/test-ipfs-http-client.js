// run it with node -r esm test.js
// it should list the keys on your ipfs node

import { create } from 'ipfs-http-client'
import { CID } from 'multiformats/cid'
import OCID from 'cids'
import { base32 } from 'multiformats/bases/base32'
import { base36 } from 'multiformats/bases/base36'

const ipfs = create('/ip4/127.0.0.1/tcp/5001')

const getDID = async cid => {
  const { value } = await ipfs.dag.get(cid)
  console.log(value)
}

const genKey = async name => {
  const key = await ipfs.key.gen(name, {
    type: 'rsa',
    size: 2048
  })
  return key
}

const rmKey = async name => {
  const key = await ipfs.key.rm(name)
  return key
}

//'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
const toBase36 = ipnsName => {
  const libp2pKey = {
    code: 0x72,
    name: 'libp2p-key'
  }
  const v0 = CID.parse(ipnsName)
  console.log('base58btc:', v0.toString())
  const v1 = CID.create(1, libp2pKey.code, v0.multihash, v0.bytes)
  return v1.toString(base36.encoder)
}

const toBase36Old = ipnsName => {
  const cidB58 = new OCID(ipnsName)
  const cidBase36 = new OCID(1, 'libp2p-key', cidB58.multihash, 'base36')
  return cidBase36.toString()
}

// ipfs.key.list().then(keys => {
//   console.log(keys)
// })

// console.log(String.fromCharCode([98, 97, 102, 121, 114, 101, 105, 99, 104, 122, 105, 51, 112, 105, 118, 51, 107, 116, 117, 112, 104, 114, 113, 50, 113, 113, 115, 102, 50, 100, 103, 54, 51, 105, 100, 111, 100, 53, 115, 122, 98, 119, 122, 99, 119, 121, 105, 50, 55, 119, 50, 113, 102, 112, 107, 98, 107, 51, 117]))

// const cid = new CID('bafyreichzi3piv3ktuphrq2qqsf2dg63idod5szbwzcwyi27w2qfpkbk3u')

// const cid = CID.parse('bafyreigyscdjmvqilz5u7lsrmpt6xhyounxvwussa2kxt3skqbvrjkverq', base32.decoder)

// console.log('cid=', cid)

const base36New = toBase36('QmSmnDg62GVfCUkehTxuosBsyFs86Ktr47HjTVVXMe4odq')
const base36Old = toBase36Old('QmSmnDg62GVfCUkehTxuosBsyFs86Ktr47HjTVVXMe4odq')

console.log('base36=', base36New)
console.log('base36=', base36Old)

// ipfs.dag.get(cid).then(({ value }) => {
//   console.log('value=', value)
// })

// getDID(cid)

// genKey('marcin').then(key => {
//   console.log(key)
// })

// rmKey('marcin').then(key => {
//   console.log(key)
// })

process.stdin.resume()
