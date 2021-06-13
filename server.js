const http = require("http")
const socketIO = require("socket.io")

const express = require("express")
const app = express()
const port = process.env.PORT || 3000
require("./server/routes.js")(app)

const server = http.createServer(app)
const io = socketIO(server)

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})



const helpers = require("./server/helpers.js")

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
    if(!callback) return

    let nickname = helpers.goodifyUserInput(data.name, true, 50)
    if(!nickname) nickname = `Mustacho${Math.round(Math.random() * 1000)}`
    
    const user = users.setUser(socket.id, new User(socket.id, nickname, socket))

    console.log(`${user.name} (${user.id}) has logged in.`)
    callback(null, { name: nickname })
  })

  socket.on("logout", (data, callback) => {
    if(!callback) return

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
    if(!callback) return

    const user = users.getUser(socket.id)

    if(!user) return callback("not_logged_in")
    if(user.getLobby()) return callback("already_in_lobby")


    let lobbyName = helpers.goodifyUserInput(data.name, true, 100)
    if(!lobbyName) {
      lobbyName = "Epic Gamer Momebt"
    }

    const createdLobby = new Lobby(lobbyName)
    const lobbyCode = createdLobby.getCode()

    if(lobbies.getLobby(lobbyCode)) {
      return callback("duplicate_lobby_code")
    }

    lobbies.setLobby(lobbyCode, createdLobby)

    const lobby = lobbies.getLobby(lobbyCode)
    const lobbyJoined = lobby.join(user.id)

    lobby.setHost(user.id)
    user.setLobby(lobbyCode)


    console.log(`${user.id} created lobby ${lobbyCode}`)
    callback(null, {
      name: lobby.getName(),
      code: lobbyCode,
      playerId: lobbyJoined.playerId,
    })
  })

  socket.on("join_lobby", (data, callback) => {
    if(!callback) return

    const user = users.getUser(socket.id)

    if(!user) return callback("not_logged_in")
    if(user.getLobby()) return callback("already_in_lobby")
    if(!data.code) return callback("no_lobby_code")

    const lobbyCode = data.code.toUpperCase()
    const lobby = lobbies.getLobby(lobbyCode)
    if(!lobby) return callback("lobby_not_found")

    if(lobby.isFull()) return callback("lobby_full")
    
    const lobbyJoined = lobby.join(user.id)
    if(!lobbyJoined) {
      return callback("lobby_error")
    }

    user.setLobby(lobbyCode)

    console.log(`${user.id} joined lobby ${lobbyCode}`)
    callback(null, {
      name: lobby.getName(),
      code: lobbyCode,
      playerId: lobbyJoined.playerId,
    })
  })


  socket.on("leave_lobby", (data, callback) => {
    if(!callback) return

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
    if(!callback) return

    let max = parseInt(data.max) || 5
    max = Math.min(Math.max(max, 1), 10)

    callback(null, { lobbies: lobbies.getTopLobbies(max) })
  })

  socket.on("edit_lobby_setting", (data, callback) => {
    if(!callback) return

    const user = users.getUser(socket.id)
    if(!user) return callback("not_logged_in")

    const lobbyId = user.getLobby()
    if(!lobbyId) return callback("not_in_lobby")
    
    /**
     * @type {Lobby} lobby
     */
    const lobby = lobbies.getLobby(lobbyId)
    if(!lobby) return callback("lobby_not_found")

    if(lobby.getHost() !== user.id) return callback("no_host_permission")

    if(data.started) {
      if(lobby.getInGame()) {
        return callback("already_playing")
      }
      lobby.setInGame(true)
      callback(null, {})
    }
  })

  socket.on("send_chat", (data, callback) => {
    if(!callback) return

    const user = users.getUser(socket.id)
    if(!user) return callback("not_logged_in")
    if(!user.getLobby()) return callback("not_in_lobby")

    let content = helpers.goodifyUserInput(data.content, true, 250)
    if(!content) return callback("chat_message_empty")
    
    const lobby = lobbies.getLobby(user.getLobby())
    if(!lobby) return callback("lobby_not_found")

    lobby.broadcast("receive_chat", {
      lines: [
        {
          text: user.getName(),
          style: {
            bold: true
          }
        },
        { text: content }
      ]
    })
  })

  socket.on("get_lobby_game", (data, callback) => {
    if(!callback) return

    const user = users.getUser(socket.id)
    if(!user) return callback("not_logged_in")
    if(!user.getLobby()) return callback("not_in_lobby")
    
    const lobby = lobbies.getLobby(user.getLobby())
    if(!lobby) return callback("lobby_not_found")

    callback(null, {
      board: lobby.getGame(true).getBoard()
    })
  })

  /*
  socket.on("choose_colour", (data, callback) => {
    // if(!callback) return

    const lobby = lobbies.getLobby(data.lobbyCode)
    // console.log(lobby)
    lobby.changeColour(socket.id, data.colour)
  })
  */

  socket.on("select_colour", (data, callback) => {
    if(!callback) return

    const user = users.getUser(socket.id)
    if(!user) return callback("not_logged_in")
    if(!user.getLobby()) return callback("not_in_lobby")
    
    const lobby = lobbies.getLobby(user.getLobby())
    if(!lobby) return callback("lobby_not_found")

    lobby.setUserColour(user.id, data.colour)
  })
})