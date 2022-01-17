import path from 'path'
import { StateSerializer } from '@identity-box/utils'
import { CID } from 'multiformats/cid'
import { base36 } from 'multiformats/bases/base36'

const PUBLISH_INTERVAL = 10000

class NamePublisher {
  ipfs
  serializer
  interval
  identities

  constructor (ipfs) {
    this.ipfs = ipfs
    this.serializer = new StateSerializer(path.resolve(process.cwd(), 'Identities.json'))
    this.identities = this.serializer.read() || {}
    if (this.needsConversion()) {
      this.convertIPNSNamesToBase36()
    }
    if (Object.keys(this.identities).length > 0) {
      this.interval = setInterval(this.publishHandler, PUBLISH_INTERVAL)
    }
  }

  needsConversion = () => {
    const ipnsNames = Object.keys(this.identities)
    for (let i = 0; i < ipnsNames.length; i++) {
      if (ipnsNames[i].startsWith('Q')) {
        return true
      }
    }
    return false
  }

  toBase36 = ipnsName => {
    const libp2pKey = {
      code: 0x72,
      name: 'libp2p-key'
    }
    const v0 = CID.parse(ipnsName)
    const v1 = CID.create(1, libp2pKey.code, v0.multihash, v0.bytes)
    return v1.toString(base36.encoder)
  }

  convertIPNSNamesToBase36 = () => {
    const identities = {}
    Object.entries(this.identities).forEach(e => {
      const [ipnsName, cid] = e
      if (ipnsName.startsWith('Q')) {
        const ipnsNameBase36 = this.toBase36(ipnsName)
        console.log(`Converted ${ipnsName} to ${ipnsNameBase36}`)
        identities[ipnsNameBase36] = cid
      } else {
        identities[ipnsName] = cid
      }
    })
    this.identities = identities
    console.log('new identities=', this.identities)
    this.serializer.write(this.identities)
  }

  reset = () => {
    this.interval && clearInterval(this.interval)
    this.interval = undefined
    this.identities = {}
  }

  publishHandler = async () => {
    const promises = Object.entries(this.identities).map(e => {
      const [topic, cid] = e
      console.log(`Publishing ${cid} on topic ${topic}`, Date.now())
      const msg = Buffer.from(cid)
      return this.ipfs.pubsub.publish(topic, msg)
    })
    await Promise.all(promises)
    // for (const [topic, cid] of Object.entries(this.identities)) {
    //   console.log(`Publishing ${cid} on topic ${topic}`, Date.now())
    //   const msg = Buffer.from(cid)
    //   await this.ipfs.pubsub.publish(topic, msg)
    // }
  }

  publish = ({ ipnsName: name, cid }) => {
    let ipnsName = name
    if (ipnsName.startsWith('Q')) {
      ipnsName = this.toBase36(ipnsName)
    }
    if (this.identities[ipnsName] && this.identities[ipnsName] === cid) {
      return { ipnsName, cid, info: 'name already exists' }
    }
    this.identities[ipnsName] = cid
    this.serializer.write(this.identities)
    if (this.interval === undefined) {
      this.interval = setInterval(this.publishHandler, PUBLISH_INTERVAL)
    }
    return { ipnsName, cid }
  }

  unpublish = async ({ ipnsName: name }) => {
    let ipnsName = name
    if (ipnsName.startsWith('Q')) {
      ipnsName = this.toBase36(ipnsName)
    }
    if (this.identities[ipnsName]) {
      delete this.identities[ipnsName]
      await this.ipfs.pubsub.unsubscribe(ipnsName)
    }
    this.serializer.write(this.identities)
    if (Object.keys(this.identities).length === 0 && this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }
    return { ipnsName }
  }
}

export { NamePublisher }
