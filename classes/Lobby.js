const users = require("../server/users.js")
const lobbies = require("../server/lobbies.js")

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
      joinTimestamp: Date.now()
    }

    helpers.userListUpdate(this)
    return true
  }

  leave(userId) {
    if(this.hasUser(userId)) {
      let wasHost = this.users[userId].host

      delete this.users[userId]
      helpers.userListUpdate(this)

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
    helpers.userListUpdate(this)
  }
}

const helpers = {
  userListUpdate: (self) => {
    self.broadcast("user_list_update", {
      users: Object.values(self.users), // do not reveal user ids
      maxPlayerCount: self.getMaxPlayers()
    })
  }
}

module.exports = Lobby