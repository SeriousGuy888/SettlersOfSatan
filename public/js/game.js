const lobbyWaitingDiv = document.querySelector("#lobby-waiting")
const lobbyPlayingDiv = document.querySelector("#lobby-playing")

const toggleInGameGui = (render) => {
  if(render) {
    lobbyWaitingDiv.style.display = "none"
    lobbyPlayingDiv.style.display = null

    canvasFunctions.setup()
  }
  else {
    lobbyWaitingDiv.style.display = null
    lobbyPlayingDiv.style.display = "none"
  }
}

socket.on("game_started_update", data => {
  if(data.started) {
    toggleInGameGui(true)
  }
  else {
    notifyUser("game ended")
  }
})