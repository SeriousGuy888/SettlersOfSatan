class User {
  constructor(id, name, socket) {
    this.id = id
    this.name = name
    this.socket = socket
    this.lobbyId = null
  }

  getId() {
    return this.id
  }

  getName() {
    return this.name
  }

  getSocket() {
    return this.socket
  }

  getLobby() {
    return this.lobbyId
  }

  setLobby(lobbyId) {
    if(!lobbyId) this.lobbyId = null
    this.lobbyId = lobbyId

    return this.lobbyId
  }

  notifyOfKick(message) {
    this.getSocket().emit("kicked_from_lobby", {
      notification: message
    })
  }
}

module.exports = User