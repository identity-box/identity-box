import { TypedArrays } from '@react-frontend-developer/buffers'

class NameResolver {
  ipfs
  serializer
  interval
  identities

  constructor (ipfs) {
    this.ipfs = ipfs
  }

  resolve = async ({ ipnsName }) => {
    let resolveFunction
    let rejectFunction
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
          new Error(`Could not resolve name: ${ipnsName}`)
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
