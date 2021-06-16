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

    canvasFunctions.stop()
  }
}

socket.on("game_started_update", data => {
  if(data.started) {
    toggleInGameGui(true)
      
    let top = 50
    for (let row of data.gameBoard) {
      let column = 50
      for (let space of row) {
        if (space) canvasFunctions.drawHexagon(column, top, space.resource)
        column += 100
      }
      top += 100
    }
  }
  else {
    notifyUser("game ended")
  }
})


let currentGameData
socket.on("game_update", data => {
  currentGameData = data
})