import Koa from 'koa'
import koaBody from 'koa-body'
import ipfsClient from 'ipfs-http-client'

class NameService {
  app = new Koa()
  ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
  interval
  identities = {}

  start = () => {
    this.app.use(koaBody())
    this.app.use(async ctx => {
      ctx.accepts('application/json')
      const response = await this.processMessage(ctx.request.body)
      ctx.response.body = response
    })

    this.app.listen(3100)
  }

  handlePublishName = async ({ ipnsName, cid }) => {
    this.identities[ipnsName] = cid
    if (this.interval === undefined) {
      this.interval = setInterval(async () => {
        for (const [topic, cid] of Object.entries(this.identities)) {
          console.log(`Publishing ${cid} on topic ${topic}`, Date.now())
          const msg = Buffer.from(cid)
          await this.ipfs.pubsub.publish(topic, msg)
        }
      }, 2000)
    }
    return { ipnsName, cid }
  }

  handleUnpublishName = async ({ ipnsName }) => {
    if (this.identities[ipnsName]) {
      delete this.identities[ipnsName]
    }
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
      }
    } catch (e) {
      console.error(e.message)
      return { status: 'error', message: e.message }
    }
  }
}

export { NameService }
