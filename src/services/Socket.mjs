import ws from 'ws'

const uuid = require('uuid/v4')





const HEALTHCHECK_INTERVAL = 30000





export default class Socket {
  handleNewConnection (client, req) {
    client.isAlive = true
    client.remoteAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    client.clientId = uuid()
    client
      .on('pong', () => {
        client.isAlive = true
      })
      .on('message', (data) => {
        console.log(`[WBSK]   Recieved Message - ${client.remoteAddress} - Message: `, data)
      })
      .on('close', () => {
        console.log(`[WBSK]  Connection Closed - ${client.remoteAddress} - ID: ${client.clientId}`)
      })

    console.log(`[WBSK]     New Connection - ${client.remoteAddress} - ID: ${client.clientId}`)

    client.send(JSON.stringify({
      data: {
        message: `Welcome to ${this.config.server.name}.
          Please send the provided id in your message's meta object.
          Any message that doesn't provide a client id will be ignored.
          If you have an authentication token to send, do so now.`,
      },
      meta: {
        action: 'welcome',
        id: client.clientId,
      },
    }))
  }

  healthCheck () {
    this.socket.clients.forEach((client) => {
      if (!client.isAlive) {
        client.terminate()
        return
      }

      client.isAlive = false
      ws.ping(() => {})
    })
  }

  constructor (server, config) {
    this.config = config
    this.socket = new ws.Server({
      server,
    })

    setInterval(this.healthCheck.bind(this), HEALTHCHECK_INTERVAL)
  }

  on (...args) {
    return this.socket.on(...args)
  }

  sendMessage (client, action, data) {
    return new Promise((resolve, reject) => {
      client.send(JSON.stringify({
        data,
        meta: {
          action,
        },
      }), (status) => {
        if (status instanceof Error) {
          reject(status.message ? status.message : null)
        } else {
          resolve()
        }
      })
    })
  }

  broadcast (action, data) {
    return Promise.all(this.socket.clients.map((client) => {
      if (client.readyState === ws.OPEN) {
        return this.sendMessage(client, action, data)
      }
      return Promise.resolve()
    }))
  }
}
