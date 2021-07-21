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
const makeTradeDiv = document.querySelector("#trade-interface-make")
const makeTradeButton = document.querySelector("#make-trade-button")
const takeTradeDiv = document.querySelector("#trade-interface-take")
const takeTradeButton = document.querySelector("#take-trade-button")

const refreshControls = () => {
  if(currentGameData.turn !== currentGameData.me.id) {
    for(let i in gameControls) gameControls[i].disabled = true

    if(currentGameData.turnStage === 1) {
      makeTradeDiv.style.display = "none"
      takeTradeDiv.style.display = currentGameData.turnCycle > 2 ? null : "none"
    }
    else {
      makeTradeDiv.style.display = "none"
      takeTradeDiv.style.display = "none"
    }

    turnButton.disabled = true
    turnButton.textContent = "It is not your turn..."

  }
  else {
    turnButton.disabled = false

    if(currentGameData.turnStage === 0) {
      for(let i in gameControls) gameControls[i].disabled = true
      turnButton.textContent = "Roll Dice"
      
      makeTradeDiv.style.display = "none"
      takeTradeDiv.style.display = "none"
    }
    else {
      for(let i in gameControls) gameControls[i].disabled = false
      turnButton.textContent = "End Turn"

      makeTradeDiv.style.display = currentGameData.turnCycle > 2 ? null : "none"
      takeTradeDiv.style.display = "none"
    }
  }
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