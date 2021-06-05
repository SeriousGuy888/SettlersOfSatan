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
    notifyUser("You are no longer the host of this lobby.")
    toggleLobbySettingsLocked(false)
  }
  if(data.gainedHost) {
    notifyUser("You are now the host!")
    toggleLobbySettingsLocked(true)
  }
})