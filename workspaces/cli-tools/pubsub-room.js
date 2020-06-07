// run it with node -r esm test.js
// it should list the keys on your ipfs node

/*************************************************
 * This example shows that it...does not work.
 * You can't use ipfs-http-client with ipfs-pubsub-room
 * because ipfs-http-client does not expose protocol and
 * stream API that is needed for direct connection between
 * peers in ipfs-pubsub-room.
 *
 * When trying to run the script we will get:
 *
 * `this._libp2p.handle is not a function`
 *
 * and ipfs-pubsub-room needs `handle` and `dialProtocol` to function.
 *
 * We still decide to keep this file in the repo as a reminder.
 *
 * See also: https://github.com/ipfs-shipyard/ipfs-pubsub-room/issues/28
 *
*************************************************/

import ipfsClient from 'ipfs-http-client'
import Room from 'ipfs-pubsub-room'

const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

const room = new Room(ipfs, 'test-room')

console.log('room:', room)

room.on('peer joined', (peer) => {
  console.log('Peer joined the room', peer)
})

room.on('peer left', (peer) => {
  console.log('Peer left...', peer)
})

room.on('message', message => {
  console.log(message.data.toString())
})

process.stdin.resume()
