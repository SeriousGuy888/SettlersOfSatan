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

const lobbies = require("./server/lobbies.js")
const users = require("./server/users.js")

io.on("connection", socket => { // https://dev.to/asciiden/how-to-use-socket-io-not-the-chat-3l21
  console.log("A user has connected to via a socket.")
  socket.on("disconnect", () => {
    const user = users.getUser(socket.id)
    if(user) {
      console.log(`${user.name} (${user.id}) disconnected.`)

      if(user.getLobby()) {
        lobbies.getLobby(user.getLobby()).leave(user.id)
      }

      users.setUser(user.id, null)
    }
    else console.log("An anonymous user has disconnected.")
  })

  socket.on("login", (data, callback) => {
    if(!data.name) data.name = `Mustacho${Math.round(Math.random() * 1000)}`
    data.name = data.name.slice(0, 100)
    
    const user = users.setUser(socket.id, new User(socket.id, data.name, socket))

    console.log(`${user.name} (${user.id}) has logged in.`)
    callback(null, data)
  })

  socket.on("logout", (data, callback) => {
    const user = users.getUser(socket.id)
    if(user) {
      console.log(`${user.name} (${user.id}) logged out.`)

      if(user.getLobby()) {
        lobbies.getLobby(user.getLobby()).leave(user.id)
      }

      users.setUser(user.id, null)
    }
    callback(null, data)
  })

  socket.on("create_lobby", (data, callback) => {
    const user = users.getUser(socket.id)

    if(!user) return callback("not_logged_in")
    if(user.getLobby()) return callback("already_in_lobby")

    if(!data.name) {
      data.name = "Epic Gamer Momebt"
    }

    const lobbyName = data.name.slice(0, 100)
    const createdLobby = new Lobby(lobbyName)
    const lobbyCode = createdLobby.getCode()

    if(lobbies.getLobby(lobbyCode)) {
      return callback("duplicate_lobby_code")
    }

    lobbies.setLobby(lobbyCode, createdLobby)
    const lobby = lobbies.getLobby(lobbyCode)
    lobby.join(user.id)
    lobby.setHost(user.id)
    
    user.setLobby(lobbyCode)


    console.log(lobby)

    console.log(`${user.id} created lobby ${lobbyCode}`)
    callback(null, {
      name: lobby.getName(),
      code: lobbyCode
    })
  })

  socket.on("join_lobby", (data, callback) => {
    const user = users.getUser(socket.id)

    if(!user) return callback("not_logged_in")
    if(user.getLobby()) return callback("already_in_lobby")
    if(!data.code) return callback("no_lobby_code")

    const lobbyCode = data.code.toUpperCase()
    const lobby = lobbies.getLobby(lobbyCode)
    if(!lobby) return callback("lobby_not_found")

    if(lobby.isFull()) return callback("lobby_full")
    
    const joinedLobby = lobby.join(user.id)
    if(!joinedLobby) {
      return callback("lobby_error")
    }

    user.setLobby(lobbyCode)

    console.log(`${user.id} joined lobby ${lobbyCode}`)
    callback(null, {
      name: lobby.getName(),
      code: lobbyCode
    })
  })


  socket.on("leave_lobby", (data, callback) => {
    const user = users.getUser(socket.id)
    if(!user) return callback("not_logged_in")
    if(!user.getLobby()) return callback("not_in_lobby")

    const lobbyCode = user.getLobby()
    const lobby = lobbies.getLobby(lobbyCode)
    lobby.leave(user.id)
    user.setLobby(null)

    console.log(`${user.id} left lobby ${lobbyCode}`)

    callback(null, {})
  })

  socket.on("get_lobbies", (data, callback) => {
    let max = parseInt(data.max) || 5
    max = Math.min(Math.max(max, 1), 10)

    callback(null, { lobbies: lobbies.getTopLobbies(max) })
  })

  socket.on("edit_lobby_setting", (data, callback) => {
    const user = users.getUser(socket.id)
    if(!user) return callback("not_logged_in")
    if(!user.getLobby()) return callback("not_in_lobby")

    if(!data.lobbyId) return callback("no_lobby_id")
    
    /**
     * @type {Lobby} lobby
     */
    const lobby = lobbies.getLobby(data.lobbyId)
    if(!lobby) return callback("lobby_not_found")

    if(lobby.getHost() !== user.id) return callback("no_host_permission")

    if(data.start) {
      lobby.setInGame(true)
      callback(null, {
        oeuf: "ok"
      })
    }
  })

  socket.on("send_chat", (data, callback) => {
    const user = users.getUser(socket.id)
    if(!user) return callback("not_logged_in")
    if(!user.getLobby()) return callback("not_in_lobby")
    if(!data.content) return callback("chat_message_empty")
    
    const lobby = lobbies.getLobby(user.getLobby())
    if(!lobby) return callback("lobby_not_found")

    lobby.broadcast("receive_chat", {
      lines: [
        user.getName(),
        data.content.slice(0, 250)
      ]
    })
  })
})