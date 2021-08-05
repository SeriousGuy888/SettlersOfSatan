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

    if(currentGameData.turnStage === 0) {
      for(let i in gameControls) gameControls[i].disabled = true
      turnButton.textContent = "Roll Dice"
    }
    else {
      for(let i in gameControls) {
        let disableButton = false
        
        if(i === "settlement") disableButton = !boardVertexes.some(v => v.data.allowPlacement && !v.data.building)
        if(i === "city") disableButton = !boardVertexes.some(v => v.data.building?.playerId === currentGameData.me.id)
        if(i === "road") disableButton = !boardEdges.some(e => e.data.allowPlacement)

        gameControls[i].disabled = disableButton
      }

      turnButton.textContent = "End Turn"
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