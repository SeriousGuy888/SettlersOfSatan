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




const Lobby = require("./classes/Lobby.js")
const User = require("./classes/User.js")

const lobbies = {}
const users = {}

io.on("connection", socket => { // https://dev.to/asciiden/how-to-use-socket-io-not-the-chat-3l21
  console.log("A user has connected to via a socket.")
  socket.on("disconnect", () => {
    if(users[socket.id]) {
      console.log(`${users[socket.id].name} (${socket.id}) disconnected.`)
      delete users[socket.id]
    }
    else console.log("An anonymous user has disconnected.")
  })

  socket.on("login", (data, callback) => {
    if(!data.name) data.name = `Mustacho${Math.round(Math.random() * 1000)}`
    data.name = data.name.slice(0, 100)
    
    users[socket.id] = new User(socket.id, data.name, socket)
    console.log(`${data.name} (${socket.id}) has logged in.`)
    callback(null, data)
  })

  socket.on("logout", (data, callback) => {
    if(users[socket.id]) {
      console.log(`${users[socket.id].name} (${socket.id}) logged out.`)
      delete users[socket.id]
    }
    callback(null, data)
  })

  socket.on("create_lobby", (data, callback) => {
    const user = users[socket.id]
    if(!user) return callback("not_logged_in")
    if(user.getLobby()) return callback("already_in_lobby")
    if(!data.name) return callback("no_lobby_name")

    const lobbyName = data.name.slice(0, 100)
    const createdLobby = new Lobby(lobbyName)
    const lobbyCode = createdLobby.getCode()

    if(lobbies[lobbyCode]) {
      return callback("duplicate_lobby_code")
    }

    lobbies[lobbyCode] = createdLobby
    const lobby = lobbies[lobbyCode]
    lobby.join(user.id)
    user.setLobby(lobbyCode)

    console.log(`${user.id} created lobby ${lobbyCode}`)
    callback(null, { code: lobbyCode })
  })

  socket.on("join_lobby", (data, callback) => {
    const user = users[socket.id]
    if(!user) return callback("not_logged_in")
    if(user.getLobby()) return callback("already_in_lobby")
    if(!data.code) return callback("no_lobby_code")

    const lobbyCode = data.code.toUpperCase()
    const lobby = lobbies[lobbyCode]

    if(!lobby) return callback("lobby_not_found")
    
    lobby.join(user.id)
    user.setLobby(lobbyCode)

    console.log(`${user.id} joined lobby ${lobbyCode}`)
    callback(null, { code: lobbyCode })
  })


  socket.on("leave_lobby", (data, callback) => {
    const user = users[socket.id]
    if(!user) return callback("not_logged_in")
    if(!user.getLobby()) return callback("not_in_lobby")

    const lobbyCode = user.getLobby()
    const lobby = lobbies[lobbyCode]
    lobby.leave(user.id)
    user.setLobby(null)

    console.log(`${user.id} left lobby ${lobbyCode}`)

    if(lobby.getUsers().size === 0) {
      console.log(`Closing empty lobby ${lobbyCode}`)
      delete lobbies[lobbyCode]
    }

    callback(null, {})
  })
})