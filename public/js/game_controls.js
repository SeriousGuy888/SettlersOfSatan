const gameControls = {
  settlement: document.querySelector("#settlement-button"),
  city: document.querySelector("#city-button"),
  road: document.querySelector("#road-button"),
  developmentCard: document.querySelector("#development-card-button"),
}
const turnButton = document.querySelector("#end-turn-dice-button")

let holding = null
const setHolding = name => {
  if(holding === name && !currentGameData.roadBuilding) holding = null
  else holding = name
  refreshControlsOutline()
}

for(let i in gameControls) {
  if(i === "developmentCard") continue
  gameControls[i].addEventListener("click", () => setHolding(i))
}

gameControls.developmentCard.addEventListener("click", () => {
  setHolding(null)
  socket.emit("perform_game_action", {
    action: "buy_development_card"
  }, (err, data) => {
    if(err) notifyUser(err)
  })
})



const refreshControlsOutline = () => {
  if(currentGameData.turnTick) { // clear holding when turn changes
    if(currentGameData.turn === currentGameData.me.id && currentGameData.turnCycle <= 2) {
      holding = "settlement"
    }
    else if(currentGameData.roadBuilding) {
      holding = "road"
    }
    else {
      holding = null
    }
  }

  for(let i in gameControls) {
    gameControls[i].classList.toggle("active", holding === i)
  }
}
const refreshControls = () => {
  if(currentGameData.turn !== currentGameData.me.id) {
    for(let i in gameControls) gameControls[i].disabled = true

    turnButton.disabled = true
    turnButton.textContent = "It is not your turn..."
  }
  else {
    turnButton.disabled = false
    turnButton.textContent = currentGameData.diceRolled ? "End Turn" : "Roll Dice"

    for(let i in gameControls) {
      if(!currentGameData.diceRolled) {
        gameControls[i].disabled = true
        gameControls[i].title = "The dice have not been rolled yet."
        continue
      }

      if(!currentGameData.me.enableControls[i]) gameControls[i].title = "You cannot afford this or there is nowhere to place this."
      else gameControls[i].title = ""
      gameControls[i].disabled = !currentGameData.me.enableControls[i]
    }
  }

  refreshControlsOutline()
}

turnButton.addEventListener("click", () => {
  setHolding(null)
  const action = currentGameData.diceRolled ? "end_turn" : "roll_dice"

  socket.emit("perform_game_action", { action },
  (err, data) => {
    if(err) notifyUser(err)
  })
})