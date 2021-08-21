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
    printToChat([{ text: "Back to lobby. New players are now allowed to join again.", style: { colour: "magenta" } }])
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
    turnPlayerHeader.textContent = "🥇 Winner"
    turnPlayer.textContent = currentGameData.players[currentGameData.winner].name
    turnPlayer.style.color = currentGameData.players[currentGameData.winner].colour
  }
  else {
    turnPlayer.textContent = currentGameData.players[currentGameData.turn].name
    turnPlayer.style.color = currentGameData.players[currentGameData.turn].colour
  }
}
setInterval(() => {
  if(!currentGameData?.turnCountdownTo) return
  const turnTimerHeader = document.querySelector("#turn-timer-header")
  const turnTimer = document.querySelector("#turn-timer")

  if(currentGameData.ended) {
    turnTimerHeader.textContent = ""
    turnTimer.textContent = "Game Over!"
    turnTimer.parentElement.classList.remove(["attention-pls"])
  }
  else {
    const msRemaining = currentGameData.turnCountdownTo - Date.now()
    const secondsRemaining = Math.floor(msRemaining / 1000)
    if(currentGameData.currentAction === "build" && secondsRemaining === 15) {
      soundEffects.fifteenSecondsLeft.play()
    }
    turnTimer.parentElement.classList.toggle("attention-pls", secondsRemaining <= 15)
  
    const actionHeaders = {
      roll_dice: "Roll Dice",
      discard: "Discarding...",
      build: "Build & Trade"
    }
    turnTimerHeader.textContent = actionHeaders[currentGameData.currentAction]
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

  if(currentGameData.ended && currentGameData.winner === currentGameData.me.id) {
    let rareWinSound = Math.floor(Math.random() * 9) === 8
    soundEffects[rareWinSound ? "win2" : "win1"].play()
  }
})