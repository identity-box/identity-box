// run it with node -r esm test.js
// it should list the keys on your ipfs node

import { create } from 'ipfs-http-client'
import { CID } from 'multiformats/cid'
import { base32 } from 'multiformats/bases/base32'

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
  const v0 = CID.parse(ipnsName)
  v0.toString()
  return v0.toV1().toString()
}

// ipfs.key.list().then(keys => {
//   console.log(keys)
// })

// console.log(String.fromCharCode([98, 97, 102, 121, 114, 101, 105, 99, 104, 122, 105, 51, 112, 105, 118, 51, 107, 116, 117, 112, 104, 114, 113, 50, 113, 113, 115, 102, 50, 100, 103, 54, 51, 105, 100, 111, 100, 53, 115, 122, 98, 119, 122, 99, 119, 121, 105, 50, 55, 119, 50, 113, 102, 112, 107, 98, 107, 51, 117]))

// const cid = new CID('bafyreichzi3piv3ktuphrq2qqsf2dg63idod5szbwzcwyi27w2qfpkbk3u')

// const cid = CID.parse('bafyreigyscdjmvqilz5u7lsrmpt6xhyounxvwussa2kxt3skqbvrjkverq', base32.decoder)

// console.log('cid=', cid)

const base36 = toBase36('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')

console.log('base36=', base36)

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
