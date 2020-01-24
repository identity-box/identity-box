import path from 'path'
import ipfsClient from 'ipfs-http-client'
import { StateSerializer } from '../services'

const PUBLISH_INTERVAL = 10000

class NameService {
  ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
  serializer
  interval
  identities

  constructor () {
    this.serializer = new StateSerializer(path.resolve(process.cwd(), 'Identities.json'))
    this.identities = this.serializer.read()
    if (Object.keys(this.identities).length > 0) {
      this.interval = setInterval(this.publishHandler, PUBLISH_INTERVAL)
    }
  }

  reset = () => {
    this.interval && clearInterval()
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

  handlePublishName = async ({ ipnsName, cid }) => {
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

  handleUnpublishName = async ({ ipnsName }) => {
    if (this.identities[ipnsName]) {
      delete this.identities[ipnsName]
    }
    this.serializer.write(this.identities)
    if (Object.keys(this.identities).length === 0 && this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }
    return { ipnsName }
  }

  handleResolveName = async ({ ipnsName }) => {
    let resolveFunction
    const handler = msg => resolveFunction(msg.data.toString())
    const promise = new Promise(resolve => {
      resolveFunction = resolve
      this.ipfs.pubsub.subscribe(ipnsName, handler)
    })
    try {
      const cid = await promise
      await this.ipfs.pubsub.unsubscribe(ipnsName, handler)
      return { ipnsName, cid }
    } catch (e) {
      return { status: 'error', message: e.message }
    }
  }

  processMessage = message => {
    console.log(message)
    try {
      switch (message.method) {
        case 'publish-name':
          return this.handlePublishName(message)
        case 'unpublish-name':
          return this.handleUnpublishName(message)
        case 'resolve-name':
          return this.handleResolveName(message)
        default:
          return { status: 'error', message: 'unknown-method' }
      }
    } catch (e) {
      console.error(e.message)
      return { status: 'error', message: e.message }
    }
  }
}

export { NameService }
