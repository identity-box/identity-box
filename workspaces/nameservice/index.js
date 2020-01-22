#!/bin/sh
':' // # http://sambal.org/?p=1014 ; exec /usr/bin/env node -r esm "$0" "$@"

import { NameService } from './src/entry-point'

// import ipfsClient from 'ipfs-http-client'
// const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
// ipfs.pubsub.ls().then(topics => {
//   console.log('topics=', topics)
// })

const nameservice = new NameService()

nameservice.start()
