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
    printToChat([{
      text: "You are no longer the host.",
      style: {
        colour: "red",
        bold: true
      }
    }])
    toggleLobbySettingsLocked(false)
  }
  if(data.gainedHost) {
    printToChat([{
      text: "You are now the host!",
      style: {
        colour: "green",
        bold: true
      }
    }])
    toggleLobbySettingsLocked(true)
  }
})


lobbyStartButton.addEventListener("click", () => {
  socket.emit("edit_lobby_setting", { started: true }, (err, data) => {
    if(err) notifyUser(err)
    else {
      canvasFunctions.setup()
      
      let top = 50
      for (let row of data.board) {
        let column = 50
        for (let space of row) {
          if (space) canvasFunctions.drawHexagon(column, top, space.resource)
          column += 100
        }
        top += 100
      }
    }
  })
})