exports.lobbyList = {}

exports.createLobby = (lobbyData) => {
  let lobbyId = ""
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for(let i = 0; i < 5; i++) {
    lobbyId += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  this.lobbyList[lobbyId] = lobbyData

  console.log(this.lobbyList)
}