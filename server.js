const http = require("http")
const socketIO = require("socket.io")

const express = require("express")
const app = express()
const port = process.env.PORT || 3000
require("./server/routes/routes.js")(app)

const server = http.createServer(app)
const io = socketIO(server)

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})



const helpers = require("./server/helpers.js")

const Lobby = require("./classes/Lobby.js")
const User = require("./classes/User.js")
const Satan = require("./classes/Satan.js")

const lobbies = require("./server/lobbies.js")
const users = require("./server/users.js")

setInterval(lobbies.tickAllLobbies, 500)

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
    callback(null, { name: nickname, colourChoices: lobbies.colourChoices })
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
    const requestValidation = helpers.validateRequest(callback, socket, {
      requireCallback: true,
      requireUser: true,
    })
    if(!requestValidation) return
    const { user } = requestValidation

    if(user.getLobby()) return callback("You are already in a lobby!")


    let lobbyName = helpers.goodifyUserInput(data.name, true, 100)
    if(!lobbyName) {
      lobbyName = "Epic Gamer Momebt"
    }

    const createdLobby = new Lobby(lobbyName)
    const lobbyCode = createdLobby.getCode()

    if(lobbies.getLobby(lobbyCode)) {
      return callback("Could not generate a unique lobby code. Please try again.")
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
    const requestValidation = helpers.validateRequest(callback, socket, {
      requireCallback: true,
      requireUser: true,
    })
    if(!requestValidation) return
    const { user } = requestValidation
    
    if(user.getLobby()) return callback("You are already in a lobby!")
    if(!data.code) return callback("No lobby code provided.")

    const lobbyCode = data.code.toUpperCase()
    const lobby = lobbies.getLobby(lobbyCode)
    if(!lobby) return callback("This lobby could not be found.")

    if(lobby.isFull()) return callback("This lobby is full.")
    if(lobby.getInGame()) return callback("This lobby is already playing.")
    
    const lobbyJoined = lobby.join(user.id)
    if(!lobbyJoined) {
      return callback("Lobby error.")
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
    const requestValidation = helpers.validateRequest(callback, socket, {
      requireCallback: true,
      requireUser: true,
      requireLobby: true,
    })
    if(!requestValidation) return
    const { user, lobby } = requestValidation
    
    lobby.leave(user.id)
    user.setLobby(null)

    console.log(`${user.id} left lobby ${lobby.code}`)
    callback(null, {})
  })

  socket.on("get_lobbies", (data, callback) => {
    const requestValidation = helpers.validateRequest(callback, socket, { requireCallback: true })
    if(!requestValidation) return

    let max = parseInt(data.max) || 5
    max = Math.min(Math.max(max, 1), 10)

    callback(null, { lobbies: lobbies.getTopLobbies(max) })
  })

  socket.on("edit_lobby_setting", (data, callback) => {
    const requestValidation = helpers.validateRequest(callback, socket, {
      requireCallback: true,
      requireUser: true,
      requireLobby: true,
      requireHost: true,
    })
    if(!requestValidation) return
    const { lobby } = requestValidation

    if(data.started) {
      if(lobby.getInGame()) {
        return callback("already_playing")
      }
      const satan = new Satan(lobby.code)
      satan.setUpBoard(4)
      lobby.setInGame(true, satan)
    }
  })

  socket.on("kick_player", (data, callback) => {
    const requestValidation = helpers.validateRequest(callback, socket, {
      requireCallback: true,
      requireUser: true,
      requireLobby: true,
      requireHost: true,
    })
    if(!requestValidation) return
    const { lobby } = requestValidation


    if(!lobby.hasUser(data.playerId, true)) return callback("Player not found.")

    let userId
    const lobbyUsers = lobby.getUsers()
    for(let lobbyUserId in lobbyUsers) {
      if(lobbyUsers[lobbyUserId].playerId === data.playerId) {
        userId = lobbyUserId
        break
      }
    }

    if(!userId) return callback("user_not_found")
    lobby.leave(userId)
    const kickedUser = users.getUser(userId)
    kickedUser.setLobby(null)
    kickedUser.updateLobbyState("You were kicked from the lobby by the host.")
    
    lobby.printToChat([
      {
        text: `${kickedUser.name} was kicked by the host`,
        style: { colour: "red" }
      }
    ])
  })

  socket.on("send_chat", (data, callback) => {
    const requestValidation = helpers.validateRequest(callback, socket, {
      requireCallback: true,
      requireUser: true,
      requireLobby: true,
    })
    if(!requestValidation) return
    const { user, lobby } = requestValidation


    let content = helpers.goodifyUserInput(data.content, true, 250)
    if(!content) return callback("chat_message_empty")

    const player = lobby.getUsers()[user.id]
    const playerColour = player.colour || "black"
    
    lobby.printToChat([
      {
        text: user.getName(),
        style: {
          bold: true,
          colour: playerColour,
        }
      },
      { text: content }
    ])
  })

  socket.on("select_colour", (data, callback) => {
    const requestValidation = helpers.validateRequest(callback, socket, {
      requireCallback: true,
      requireUser: true,
      requireLobby: true,
    })
    if(!requestValidation) return
    const { user, lobby } = requestValidation

    if(lobby.getInGame()) return callback("You cannot change your colour while a game is ongoing.")
    lobby.setUserColour(user.id, data.colour)
  })

  socket.on("perform_game_action", (data, callback) => {
    const requestValidation = helpers.validateRequest(callback, socket, {
      requireCallback: true,
      requireUser: true,
      requireLobby: true,
    })
    if(!requestValidation) return
    const { user, lobby } = requestValidation

    if(!lobby.getInGame()) return callback("not_playing")

    if(typeof data !== "object") return callback("invalid_action_data")
    lobby.game.processAction(user.playerId, data)
  })
})