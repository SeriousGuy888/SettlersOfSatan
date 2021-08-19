const lobbies = {}

exports.colourChoices = ["brown", "red", "orange", "green", "blue", "indigo", "violet"]

exports.getLobby = (lobbyId) => {
  if(lobbyId in lobbies) {
    return lobbies[lobbyId]
  }
  return null
}

exports.getPublicLobbyInfo = (lobbyId) => {
  const lobby = lobbies[lobbyId]
  if(!lobby) return null

  return {
    name: lobby.getName(),
    code: lobby.getCode(),
    users: JSON.parse(JSON.stringify(Object.values(lobby.getUsers()))).map(e => { delete e.userId; return e }), // do not reveal user ids
    playerCount: Object.keys(lobby.getUsers()).length,
    maxPlayerCount: lobby.getMaxPlayers(),
    inGame: lobby.getInGame()
  }
}

exports.getTopLobbies = (max) => {
  let inc = 0
  const foundLobbies = []
  for(let lobbyId in lobbies) {
    let lobbyInfo = this.getPublicLobbyInfo(lobbyId)
    if(!lobbyInfo.inGame) {
      foundLobbies.push(lobbyInfo)
      inc++
      if(inc >= max) {
        break
      }
    }
  }

  return foundLobbies
}

exports.setLobby = (lobbyId, data) => {
  if(data) {
    lobbies[lobbyId] = data
    return lobbies[lobbyId]
  }
  else {
    delete lobbies[lobbyId]
    return null
  }
}

exports.tickAllLobbies = () => {
  for(const i in lobbies) {
    const lobby = lobbies[i]
    lobby.tick()
  }
}