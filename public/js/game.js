const lobbyWaitingDiv = document.querySelector("#lobby-waiting")
const lobbyPlayingDiv = document.querySelector("#lobby-playing")
const leftColumnDiv = document.querySelector("#left-column")

const gameStatusMessage = document.querySelector("#game-status-message")

const toggleInGameGui = (render) => {
  if(render) {
    lobbyWaitingDiv.style.display = "none"
    lobbyPlayingDiv.style.display = null
    leftColumnDiv.style.display = null
    turnControls.style.display = null
    
    canvasFunctions.setup()
  }
  else {
    lobbyWaitingDiv.style.display = null
    lobbyPlayingDiv.style.display = "none"
    leftColumnDiv.style.display = "none"
    turnControls.style.display = "none"

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


const setStatusMessage = (msg) => {
  gameStatusMessage.textContent = msg
}


let currentGameData
socket.on("game_update", gData => {
  currentGameData = gData

  socket.emit("request_player_data_update", {}, (err, pData) => {
    if(err) notifyUser(err)
    else {
      currentGameData.me = pData
      canvasFunctions.refreshBoard()
      refreshResourceCards()
      refreshTurnControls()
      
      document.getElementById("inv-list").innerHTML = `Settlements: ${currentGameData.me.inventory.settlements}, Roads: ${currentGameData.me.inventory.roads}, Cities: ${currentGameData.me.inventory.cities}`
      
      setStatusMessage(`turn: ${currentGameData.turn}, turn cycle: ${currentGameData.turnCycle}, turn stage ${currentGameData.turnStage}`)
    }
  })
})