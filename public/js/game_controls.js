const gameControls = {
  settlement: document.querySelector("#settlement-button"),
  city: document.querySelector("#city-button"),
  road: document.querySelector("#road-button"),
  developmentCard: document.querySelector("#development-card-button"),
}

let holding = null
const setHolding = name => {
  if(holding === name) holding = null
  else holding = name
}

gameControls.settlement.addEventListener("click", () => setHolding("settlement"))
gameControls.city.addEventListener("click", () => setHolding("city"))
gameControls.road.addEventListener("click", () => setHolding("road"))





const turnControls = document.querySelector("#turn-controls")
const turnButton = document.querySelector("#end-turn-dice-button")
const tradePanel = document.querySelector("#trade-panel")

const refreshControls = () => {
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
      for(let i in gameControls) gameControls[i].disabled = false
      turnButton.textContent = "End Turn"
    }
  }

  tradePanel.style.display = currentGameData.turnCycle > 2 ? null : "none"
}

makeTradeButton.addEventListener("click", () => {
  socket.emit("perform_game_action", {
    action: "offer_trade"
  }, (err, data) => {
    if(err) notifyUser(err)
  })
})
takeTradeButton.addEventListener("click", () => {
  socket.emit("perform_game_action", {
    action: "accept_trade",
    idempotency: currentGameData.trade.idempotency
  }, (err, data) => {
    if(err) notifyUser(err)
  })
})

turnButton.addEventListener("click", () => {
  holding = null
  const action = currentGameData.turnStage === 0 ? "roll_dice" : "end_turn"

  socket.emit("perform_game_action", { action },
  (err, data) => {
    if(err) notifyUser(err)
  })
})