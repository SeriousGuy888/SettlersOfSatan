const Satan = require("./Satan.js")
const Player = require("./Player.js")

const users = require("../server/users.js")
const lobbies = require("../server/lobbies.js")

const { colourChoices } = lobbies

class Lobby {
  constructor(name) {
    let lobbyCode = ""
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for(let i = 0; i < 5; i++) {
      lobbyCode += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    this.name = name
    this.maxPlayers = 6
    this.code = lobbyCode
    this.users = {}
    this.takenColours = new Set()
    this.inGame = false
    this.game = null
  }

  isFull() {
    return Object.keys(this.users).length >= this.maxPlayers
  }

  hasUser(id, byPlayerId) {
    if(!byPlayerId) {
      return id in this.users
    }
    else {
      let hasPlayer = false
      for(let i in this.users) {
        if(this.users[i].playerId === id) {
          hasPlayer = true
          break
        }
      }

      return hasPlayer
    }
  }

  tick() {
    if(this.game) {
      this.game.tick()
    }
  }

  join(userId) {
    if(this.hasUser(userId)) return

    this.users[userId] = {
      name: users.getUser(userId).name,
      joinTimestamp: Date.now(),
      playerId: `${Date.now()}${Math.round(Math.random() * 1000).toString().padStart(3, "0")}`,
    }

    this.printToChat([{
      text: `${users.getUser(userId).getName()} joined the lobby`,
      style: { colour: "blue" }
    }])

    this.setUserColour(userId)

    lobbyHelpers.emitLobbyUpdate(this)
    return { playerId: this.users[userId].playerId }
  }

  leave(userId) {
    if(this.hasUser(userId)) {
      let wasHost = this.users[userId].host

      this.takenColours.delete(this.users[userId].colour)

      this.printToChat([{
        text: `${users.getUser(userId).getName()} left the lobby`,
        style: { colour: "red" }
      }])

      delete this.users[userId]
      lobbyHelpers.emitLobbyUpdate(this)

      if(Object.keys(this.getUsers()).length === 0) { // if the lobby is now empty
        console.log(`Closed empty lobby ${this.code}`)
        this.close() // close the lobby
        return true
      }

      if(wasHost) { // if the user who left was the lobby host
        let earliestJoinerId
        for(let i in this.users) { // find the user in the lobby who joined earliest
          if(!earliestJoinerId || this.users[i].joinTimestamp < this.users[earliestJoinerId].joinTimestamp) {
            earliestJoinerId = i
          }
        }

        this.setHost(earliestJoinerId) // give host privileges to that human
      }

      return true
    }
    return false
  }

  close() {
    lobbies.setLobby(this.code, null)
  }

  broadcast(msg, data) {
    for(let userId in this.users) {
      const user = users.getUser(userId)
      user.socket.emit(msg, data)
    }
  }

  printToChat(lines) {
    this.broadcast("receive_chat", { lines })
  }

  getUsers() {
    return this.users
  }

  getMaxPlayers() {
    return this.maxPlayers
  }

  getName() {
    return this.name
  }

  getCode() {
    return this.code
  }

  getInGame() {
    return this.inGame
  }

  getHost() {
    for(let userId in this.users) {
      if(this.users[userId].host) {
        return userId
      }
    }
    return null
  }

  getGame() {
    return this.game
  }

  setHost(userId) {
    for(let loopUserId in this.users) {
      if(this.users[loopUserId].host) {
        delete this.users[loopUserId].host
        users.getUser(loopUserId).socket.emit("host_change", {
          lostHost: true
        })
      }
    }
    this.users[userId].host = true
    users.getUser(userId).socket.emit("host_change", {
      gainedHost: true
    })
    lobbyHelpers.emitLobbyUpdate(this)
  }

  setInGame(inGame, game) {
    this.inGame = inGame
    lobbyHelpers.emitLobbyUpdate(this)
    if(inGame) {
      this.game = game
      for(const i in this.users) {
        const user = this.users[i]
        this.game.setPlayer(user.playerId, new Player(user.colour))
      }
    }
    this.broadcast("game_started_update", { started: inGame })
  }

  setUserColour(userId, colour) {
    if(this.takenColours.has(colour)) return

    if(!colour) {
      const availableColours = colourChoices.filter(loopCol => !this.takenColours.has(loopCol))
      colour = availableColours[Math.floor(Math.random() * availableColours.length)]
    }

    if(!colourChoices.includes(colour)) return

    this.takenColours.delete(this.users[userId].colour)
    this.users[userId].colour = colour
    this.takenColours.add(colour)

    lobbyHelpers.emitLobbyUpdate(this)
  }
}

const lobbyHelpers = {
  emitLobbyUpdate: (lobby) => {
    lobby.broadcast("lobby_update", lobbies.getPublicLobbyInfo(lobby.getCode()))
  }
}

module.exports = Lobby