import http from 'http'
import Koa from 'koa'
import { promisify } from 'util'





import config from './config'
import Mpd from './services/Mpd'
import Socket from './services/Socket'

const NOT_AUTHORIZED_ERROR = 401



const app = new Koa()
const server = http.createServer(app.callback())


server.wss = new Socket(server, config.server)
server.mpdc = new Mpd(server.wss, config.mpd)


app.use((ctx) => {
  console.log(ctx)

  ctx.throw(NOT_AUTHORIZED_ERROR, 'access_denied')
})


;(async () => {
  try {
    await server.mpdc.connect()

    const listen = promisify(server.listen.bind(server))
    await listen(config.server.port, config.server.hostname)

    console.log(`[HTTP]     Server Started - Listening on ${server.address().port}`)
  } catch (error) {
    console.log(`[HTTP]        FATAL ERROR - Failed to start server. Message: ${error.message}`)
  }
})()
