const lobbies = {}

exports.colourChoices = ["red", "orange", "green", "blue", "indigo", "violet", "brown", "black", "wheat"]

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
    members: JSON.parse(JSON.stringify(Object.values(lobby.getMembers()))).map(e => { delete e.userId; return e }), // do not reveal user ids
    playerCount: lobby.getPlayerCount(),
    maxPlayerCount: lobby.getMaxPlayers(),
    spectatorCount: lobby.getPlayerCount(true),
    inGame: lobby.getInGame()
  }
}

exports.getTopLobbies = (max) => {
  let inc = 0
  const foundLobbies = []
  for(let lobbyId in lobbies) {
    let lobbyInfo = this.getPublicLobbyInfo(lobbyId)
    foundLobbies.push(lobbyInfo)

    inc++
    if(inc >= max)
      break
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