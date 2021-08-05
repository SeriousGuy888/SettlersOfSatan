const gameControls = {
  settlement: document.querySelector("#settlement-button"),
  city: document.querySelector("#city-button"),
  road: document.querySelector("#road-button"),
  developmentCard: document.querySelector("#development-card-button"),
}
const turnButton = document.querySelector("#end-turn-dice-button")

let holding = null
const setHolding = name => {
  if(holding === name) holding = null
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
    holding = null
  }

  for(let i in gameControls) {
    gameControls[i].classList.toggle("active", holding === i)
  }
}
const refreshControls = () => {
  refreshControlsOutline()

  if(currentGameData.turn !== currentGameData.me.id) {
    for(let i in gameControls) gameControls[i].disabled = true

    turnButton.disabled = true
    turnButton.textContent = "It is not your turn..."
  }
  else {
    turnButton.disabled = false
    turnButton.textContent = currentGameData.turnStage === 0 ? "Roll Dice" : "End Turn"

    for(let i in gameControls) {
      if(currentGameData.turnStage === 0) {
        gameControls[i].disabled = true
        gameControls[i].title = "The dice have not been rolled yet."
        continue
      }

      if(!currentGameData.me.enableControls[i]) gameControls[i].title = "You cannot afford this or there is nowhere to place this."
      else gameControls[i].title = ""
      gameControls[i].disabled = !currentGameData.me.enableControls[i]
    }
  }
}

turnButton.addEventListener("click", () => {
  setHolding(null)
  const action = currentGameData.turnStage === 0 ? "roll_dice" : "end_turn"

  socket.emit("perform_game_action", { action },
  (err, data) => {
    if(err) notifyUser(err)
  })
})