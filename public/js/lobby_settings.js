const lobbyStartButton = document.querySelector("#lobby-settings-start")

const toggleLobbySettingsLocked = (isHost) => {
  if(isHost) {
    lobbyStartButton.disabled = null
  }
  else {
    lobbyStartButton.disabled = true
  }
}

socket.on("host_change", data => {
  if(data.lostHost) {
    printToChat(["You are no longer the host of this lobby."])
    toggleLobbySettingsLocked(false)
  }
  if(data.gainedHost) {
    printToChat(["You are now the host!"])
    toggleLobbySettingsLocked(true)
  }
})


lobbyStartButton.addEventListener("click", () => {
  socket.emit("edit_lobby_setting", {
    lobbyId: currentLobbyData.code,
    start: true,
  }, (err, data) => {
    if(err) notifyUser(err)
    else {
      notifyUser(JSON.stringify(data))
    }
  })
})