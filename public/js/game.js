const lobbyWaitingDiv = document.querySelector("#lobby-waiting")
const lobbyPlayingDiv = document.querySelector("#lobby-playing")
const resourceCardsDiv = document.querySelector("#resource-cards")

const toggleInGameGui = (render) => {
  if(render) {
    lobbyWaitingDiv.style.display = "none"
    lobbyPlayingDiv.style.display = null
    resourceCardsDiv.style.display = null

    canvasFunctions.setup()
  }
  else {
    lobbyWaitingDiv.style.display = null
    lobbyPlayingDiv.style.display = "none"
    resourceCardsDiv.style.display = "none"

    canvasFunctions.stop()
  }
}

socket.on("game_started_update", data => {
  if(data.started) {
    toggleInGameGui(true)
  }
  else {
    toggleInGameGui(false)
    notifyUser("game ended")
  }
})


let currentGameData
socket.on("game_update", gData => {
  currentGameData = gData

  socket.emit("request_player_data_update", {}, (err, pData) => {
    if(err) notifyUser(err)
    else {
      currentGameData.me = pData
      canvasFunctions.refreshBoard()
    }
  })
})