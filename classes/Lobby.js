const users = require("../server/users.js")

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
    this.users = new Set()
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

    this.users.add(userId)
    this.broadcast("chat", {
      lines: [`${users.getUser(userId).name} joined the lobby`]
    })
    return true
  }

  leave(userId) {
    if(this.hasUser(userId)) {
      this.users.delete(userId)
    }
    return false
  }

  broadcast(msg, data) {
    this.users.forEach(userId => {
      const user = users.getUser(userId)
      user.socket.emit(msg, data)
    })
  }

  getUsers() {
    return this.users
  }

  getCode() {
    return this.code
  }
}

module.exports = Lobby