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
    this.users = new Map()
  }

  isFull() {
    return this.users.size >= this.maxPlayers
  }

  hasUser(userId) {
    return this.users.has(userId)
  }

  join(userId) {
    if(this.isFull()) return false
    if(this.hasUser(userId)) return false

    this.users.set(userId, {})
    helpers.userListUpdate(this)
    return true
  }

  leave(userId) {
    if(this.hasUser(userId)) {
      this.users.delete(userId)
      helpers.userListUpdate(this)

      if(this.getUsers().size === 0) {
        console.log(`Closed empty lobby ${this.code}`)
        this.close()
      }

      return true
    }
    return false
  }

  close() {
    lobbies.setLobby(this.code, null)
  }

  broadcast(msg, data) {
    Array.from(this.users.keys()).forEach(userId => {
      const user = users.getUser(userId)
      user.socket.emit(msg, data)
    })
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
}

const helpers = {
  userListUpdate: (self) => {
    self.broadcast("user_list_update", {
      users: Array.from(self.users.keys()).map(uid => users.getUser(uid)?.name)
    })
  }
}

module.exports = Lobby