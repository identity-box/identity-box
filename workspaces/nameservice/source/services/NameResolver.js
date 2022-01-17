import { TypedArrays } from '@react-frontend-developer/buffers'
import { CID } from 'multiformats/cid'

class NameResolver {
  ipfs
  serializer
  interval
  identities

  constructor (ipfs) {
    this.ipfs = ipfs
  }

  toBase36 = ipnsName => {
    const v0 = CID.parse(ipnsName)
    v0.toString()
    return v0.toV1().toString()
  }

  resolve = async ({ ipnsName: name }) => {
    let resolveFunction
    let rejectFunction
    let ipnsName = name
    if (ipnsName.startsWith('Q')) {
      ipnsName = this.toBase36(ipnsName)
    }
    const handler = msg => resolveFunction(TypedArrays.uint8Array2string(msg.data, 'utf8'))
    const promise = new Promise((resolve, reject) => {
      resolveFunction = resolve
      rejectFunction = reject
      this.ipfs.pubsub.subscribe(ipnsName, handler)
    })
    try {
      const timeout = setTimeout(async () => {
        await this.ipfs.pubsub.unsubscribe(ipnsName, handler)
        rejectFunction(
          new Error(`Could not resolve name: ${name}`)
        )
      }, 15000)
      const cid = await promise
      clearTimeout(timeout)
      await this.ipfs.pubsub.unsubscribe(ipnsName, handler)
      return { ipnsName, cid }
    } catch (e) {
      return { status: 'error', message: e.message }
    }
  }
}

export { NameResolver }
