let currentLobbyData
socket.on("lobby_update", data => {
  currentLobbyData = data
  refreshPlayerList()
})