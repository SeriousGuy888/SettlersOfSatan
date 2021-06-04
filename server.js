const http = require("http")
const socketIO = require("socket.io")

const express = require("express")
const app = express()
const port = 3000
require("./server/routes.js")(app)

const server = http.createServer(app)
const io = socketIO(server)

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

io.on("connection", socket => { // https://dev.to/asciiden/how-to-use-socket-io-not-the-chat-3l21
  console.log("A user has connected to via a socket.")
  socket.on("disconnect", () => {
    console.log("A user has disconnected.")
  })

  socket.on("oeuf", data => {
    io.emit("egg", data)
    console.log("oeuf")
  })
})