// run it with node -r esm test.js
// it should list the keys on your ipfs node

import ipfsClient from 'ipfs-http-client'
// import CID from 'cids'

const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

// const getDID = async cid => {
//   const { value } = await ipfs.dag.get(cid)
//   console.log(value)
// }

// const genKey = async name => {
//   const key = await ipfs.key.gen(name, {
//     type: 'rsa',
//     size: 2048
//   })
//   return key
// }

ipfs.key.list().then(keys => {
  console.log(keys)
})

// console.log(String.fromCharCode([98, 97, 102, 121, 114, 101, 105, 99, 104, 122, 105, 51, 112, 105, 118, 51, 107, 116, 117, 112, 104, 114, 113, 50, 113, 113, 115, 102, 50, 100, 103, 54, 51, 105, 100, 111, 100, 53, 115, 122, 98, 119, 122, 99, 119, 121, 105, 50, 55, 119, 50, 113, 102, 112, 107, 98, 107, 51, 117]))

// const cid = new CID('bafyreichzi3piv3ktuphrq2qqsf2dg63idod5szbwzcwyi27w2qfpkbk3u')

// console.log('cid=', cid)

// ipfs.dag.get(cid).then(({ value }) => {
//   console.log('value=', value)
// })

// getDID(cid)

// genKey('marcin').then(key => {
//   console.log(key)
// })

process.stdin.resume()
