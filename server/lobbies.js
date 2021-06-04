const lobbies = {}

exports.getLobby = (userId) => {
  if(userId in lobbies) {
    return lobbies[userId]
  }
  return null
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