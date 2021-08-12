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
    currentGameData = null
  }
})


const setStatusMessage = (msg) => {
  gameStatusMessage.textContent = msg
}

const refreshTurnDisplay = () => {
  const turnPlayerHeader = document.querySelector("#turn-player-header")
  const turnPlayer = document.querySelector("#turn-player")

  if(currentGameData.ended) {
    turnPlayerHeader.textContent = `Winner: ${currentGameData.players[currentGameData.winner].name}`
    turnPlayer.textContent = "Take your screenshots now."
    turnPlayer.style.color = null
  }
  else {
    turnPlayer.textContent = currentGameData.players[currentGameData.turn].name
    turnPlayer.style.color = currentGameData.players[currentGameData.turn].colour
  }
}
setInterval(() => {
  if(!currentGameData?.turnCountdownTo) return
  const turnTimer = document.querySelector("#turn-timer")

  if(currentGameData.ended) {
    turnTimer.textContent = "Game Over!"
    turnTimer.parentElement.classList.remove(["attention-pls"])
  }
  else {
    const msRemaining = currentGameData.turnCountdownTo - Date.now()
    const secondsRemaining = Math.floor(msRemaining / 1000)
    if(secondsRemaining === 15) soundEffects.fifteenSecondsLeft.play()
    turnTimer.parentElement.classList.toggle("attention-pls", secondsRemaining <= 15)
  
    turnTimer.textContent = secondsRemaining
  }
}, 1000)


let currentGameData
socket.on("game_update", gData => {
  if(!currentLobbyData.inGame) return
  currentGameData = gData
})

socket.on("player_update", pData => {
  if(!currentLobbyData.inGame) return
  currentGameData.me = pData

  canvasFunctions.refreshBoard()
  refreshResourceCards()
  refreshControls()
  refreshTradeMenu()
  refreshTurnDisplay()
  refreshPlayerList()
  refreshDevelopmentCards()

  if(currentGameData.roadBuilding){
    setHolding("road")
  }

  document.getElementById("inv-list").innerHTML = `Settlements: ${currentGameData.me.inventory.settlements}, Roads: ${currentGameData.me.inventory.roads}, Cities: ${currentGameData.me.inventory.cities}`

  if(currentGameData.turnTick && currentGameData.turn === currentGameData.me.id) {
    soundEffects.yourTurn.play()
  }
})