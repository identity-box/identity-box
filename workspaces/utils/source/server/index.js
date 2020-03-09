import http from 'http'
import Koa from 'koa'
import koaBody from 'koa-body'

class Server {
  app
  nameservice

  constructor (nameservice) {
    this.nameservice = nameservice
    this.app = new Koa()
    this.app.use(koaBody())
    this.app.use(async ctx => {
      ctx.accepts('application/json')
      const response = await this.nameservice.processMessage(ctx.request.body)
      ctx.response.body = response
    })
  }

  start = () => {
    http.createServer(this.app.callback()).listen(3100)
  }
}

export { Server }
