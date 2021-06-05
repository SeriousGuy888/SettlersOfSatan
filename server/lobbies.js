const lobbies = {}

exports.getLobby = (lobbyId) => {
  if(lobbyId in lobbies) {
    return lobbies[lobbyId]
  }
  return null
}

exports.getTopLobbies = (max) => {
  let inc = 0
  const foundLobbies = []
  for(let lobbyId in lobbies) {
    let lobbyInfo = {
      name: lobbies[lobbyId].name,
      code: lobbies[lobbyId].getCode(),
      playerCount: lobbies[lobbyId].getUsers().size,
      maxPlayerCount: lobbies[lobbyId].getMaxPlayers(),
    }
    foundLobbies.push(lobbyInfo)

    inc++
    if(inc >= max) {
      break
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