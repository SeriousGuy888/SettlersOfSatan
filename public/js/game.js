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
    currentGameData = undefined
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

const refreshTurnDisplay = () => {
  const turnPlayer = document.querySelector("#turn-player")
  const turnCycleStage = document.querySelector("#turn-cycle-stage")

  turnPlayer.textContent = currentGameData.players[currentGameData.turn].name
  turnPlayer.style.color = currentGameData.players[currentGameData.turn].colour
  turnCycleStage.textContent = `C${currentGameData.turnCycle} | S${currentGameData.turnStage}`
}
setInterval(() => {
  if(!currentGameData?.turnCountdownTo) return
  const turnTimer = document.querySelector("#turn-timer")

  const msRemaining = currentGameData.turnCountdownTo - Date.now()
  const secondsRemaining = Math.floor(msRemaining / 1000)

  if(secondsRemaining <= 15) turnTimer.parentElement.classList.add(["attention-pls"])
  else turnTimer.parentElement.classList.remove(["attention-pls"])

  turnTimer.textContent = secondsRemaining
}, 1000)


let currentGameData
socket.on("game_update", gData => {
  currentGameData = gData

  socket.emit("request_player_data_update", {}, (err, pData) => {
    if(err) notifyUser(err)
    else {
      currentGameData.me = pData
      canvasFunctions.refreshBoard()
      refreshResourceCards()
      refreshControls()
      refreshTurnDisplay()
      
      document.getElementById("inv-list").innerHTML = `Settlements: ${currentGameData.me.inventory.settlements}, Roads: ${currentGameData.me.inventory.roads}, Cities: ${currentGameData.me.inventory.cities}`
    }
  })
})