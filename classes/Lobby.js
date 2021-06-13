const Satan = require("./Satan.js")

const users = require("../server/users.js")
const lobbies = require("../server/lobbies.js")
const allowedColours = ["red", "white", "blue", "orange", "green", "purple"]

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
    this.allowedColours = allowedColours
    this.inGame = false
    this.game = null
  }

  isFull() {
    return Object.keys(this.users).length >= this.maxPlayers
  }

  hasUser(userId) {
    return userId in this.users
  }

  join(userId) {
    if(this.hasUser(userId)) return false

    this.users[userId] = {
      name: users.getUser(userId).name,
      joinTimestamp: Date.now(),
      playerId: `${Date.now()}${Math.round(Math.random() * 1000).toString().padStart(3, "0")}`,
      colour: allowedColours[Math.floor(Math.random() * allowedColours.length)]
    }

    this.changeAllowedColours(userId, undefined, [this.users[userId].colour])
    console.log(this.allowedColours)
    lobbyHelpers.emitLobbyUpdate(this)
    return true
  }

  leave(userId) {
    if(this.hasUser(userId)) {
      let wasHost = this.users[userId].host

      this.allowedColours = allowedColours

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

  setInGame(inGame) {
    this.inGame = inGame
    lobbyHelpers.emitLobbyUpdate(this)
    this.broadcast("game_started_update", { started: inGame })
    if(inGame) {
      this.game = new Satan()
    }
  }

  changeColour(userId, colour) {
    console.log("asddddddddddddddddd colour: " + this.users[userId].colour)
    let oldColour = this.users[userId].colour
    this.users[userId].colour = colour
    // console.log(this.users[userId])
    lobbyHelpers.emitLobbyUpdate(this)
    // console.log(oldColour)
    this.changeAllowedColours(userId, oldColour, this.users[userId].colour)
  }

  changeAllowedColours(userId, add, remove) {
    if (add) {
      console.log(add)
      if (!(add instanceof Array)) add = [add]
      for (let loopAdd of add) this.allowedColours.push(loopAdd)
    }

    if (remove) {
      if (!(remove instanceof Array)) remove = [remove]
      this.allowedColours.splice(this.allowedColours.indexOf(remove[0]), remove.length)
    }

    // console.log(users.getUser(userId))
    console.log(this.allowedColours)
    for(let loopUser of users.getUsers()) {
      loopUser.socket.emit("change_allowed_colours", {
        newAllowedColours: allowedColours,
        userColour: this.users[userId].colour
      })
    }
  }
}

const lobbyHelpers = {
  emitLobbyUpdate: (lobby) => {
    lobby.broadcast("lobby_update", lobbies.getPublicLobbyInfo(lobby.getCode()))
  }
}

module.exports = Lobby