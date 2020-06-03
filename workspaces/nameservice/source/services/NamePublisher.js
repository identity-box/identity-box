import path from 'path'
import { StateSerializer } from '@identity-box/utils'

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
    if (Object.keys(this.identities).length > 0) {
      this.interval = setInterval(this.publishHandler, PUBLISH_INTERVAL)
    }
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

  publish = ({ ipnsName, cid }) => {
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

  unpublish = async ({ ipnsName }) => {
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
