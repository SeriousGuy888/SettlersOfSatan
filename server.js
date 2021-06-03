const express = require("express")
const http = require("http")
const WebSocket = require("ws")

const app = express()
const port = 3000
require("./server/routes.js")(app)

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4
wss.on("connection", ws => {
  ws.isAlive = true
  ws.on("pong", () => ws.isAlive = true)

  ws.on("message", message => {
    console.log(`received ${message} from websocket`)

    const broadcastRegex = /^broadcast\:/
    if(broadcastRegex.test(message)) {
      message = message.replace(broadcastRegex, "")

      //send back the message to the other clients
      wss.clients.forEach(client => {
        if(client !== ws) {
          client.send(`Hello, broadcast message -> ${message}`)
        }    
      })
    }
    else {
      ws.send(`Hello, you sent -> ${message}`)
    }
  })

  ws.send("You've connected to a websocket!")
})

setInterval(() => { // nuke inactive websockets
  wss.clients.forEach(ws => {
    if(!ws.isAlive) return ws.terminate()

    ws.isAlive = false
    ws.ping(null, false, true)
  })
}, 10000)




server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port} | ws://localhost:${port}`)
})