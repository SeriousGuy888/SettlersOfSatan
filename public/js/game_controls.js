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

  const createTradeInputs = (container, rightColumn) => {
    if(!container.childElementCount) {
      const frag = document.createDocumentFragment()
  
      for(let resourceName in resourceDivNames) {
        const currentResourceDiv = document.createElement("div")
        currentResourceDiv.className = "trade-amount-div"
        rightColumn && currentResourceDiv.classList.add(["trade-amount-div-right"])
  
        const img = createResourceImg(resourceName)
        const inputElem = document.createElement("input")
        inputElem.type = "number"
        inputElem.min = 0
        inputElem.value = 0
        inputElem.id = `trade-amount-input-${resourceName}`
        
        currentResourceDiv.appendChild(img)
        currentResourceDiv.appendChild(inputElem)
        frag.appendChild(currentResourceDiv)
      }
  
      container.appendChild(frag)
    }
  }
  createTradeInputs(tradeOffererInputs, false)
  createTradeInputs(tradeTakerInputs, true)





  offererNameP.textContent = currentGameData.players[currentGameData.turn].name
  offererNameP.style.color = currentGameData.players[currentGameData.turn].colour
  takerNameP.textContent = "Everyone"

  if(currentGameData.turnStage === 1) {
    tradeButton.textContent = currentGameData.turn === currentGameData.me.id ? "Propose Trade" : "Accept Trade"
    tradeButton.disabled = false
    tradeInterfaceDiv.style.display = null
  }
  else {
    tradeButton.textContent = "Roll dice before trading..."
    tradeButton.disabled = true
    tradeInterfaceDiv.style.display = "none"
  }

  for(let resourceName in resourceDivNames) {
    const offererResourceInput = tradeOffererInputs.querySelector(`#trade-amount-input-${resourceName}`)
    const takerResourceInput = tradeTakerInputs.querySelector(`#trade-amount-input-${resourceName}`)

    if(currentGameData.turnTick) {
      offererResourceInput.value = 0
      takerResourceInput.value = 0
    }

    if(currentGameData.turn === currentGameData.me.id) {
      offererResourceInput.disabled = false
      takerResourceInput.disabled = false
    }
    else {
      if(currentGameData.trade.offer) {
        offererResourceInput.disabled = true
        takerResourceInput.disabled = true
        offererResourceInput.value = currentGameData.trade.offer.offerer[resourceName] ?? 0
        takerResourceInput.value = currentGameData.trade.offer.taker[resourceName] ?? 0
      }
      else {
        tradeButton.disabled = true
        tradeButton.textContent = "No trade offer..."

        tradeInterfaceDiv.style.display = "none"
      }
    }
  }
}

const tradeInterfaceDiv = document.querySelector("#trade-interface")
const tradeButton = document.querySelector("#trade-button")
const tradeOffererInputs = document.querySelector("#trade-offerer-inputs")
const tradeTakerInputs = document.querySelector("#trade-taker-inputs")
const offererNameP = document.querySelector("#trade-offerer-name")
const takerNameP = document.querySelector("#trade-taker-name")


tradeButton.addEventListener("click", () => {
  if(currentGameData.turn === currentGameData.me.id) {
    const offererAmounts = {}
    const takerAmounts = {}
    for(let resourceName in resourceDivNames) {
      const offererResourceInput = tradeOffererInputs.querySelector(`#trade-amount-input-${resourceName}`)
      const takerResourceInput = tradeTakerInputs.querySelector(`#trade-amount-input-${resourceName}`)
      offererAmounts[resourceName] = parseInt(offererResourceInput?.value) || 0
      takerAmounts[resourceName] = parseInt(takerResourceInput?.value) || 0
    }
  
    const offer = {
      offerer: offererAmounts,
      taker: takerAmounts
    }
  
    socket.emit("perform_game_action", {
      action: "offer_trade",
      offer,
    }, (err, data) => {
      if(err) notifyUser(err)
    })
  }
  else {
    socket.emit("perform_game_action", {
      action: "accept_trade",
      idempotency: currentGameData.trade.idempotency
    }, (err, data) => {
      if(err) notifyUser(err)
    })
  }
})

turnButton.addEventListener("click", () => {
  holding = null
  const action = currentGameData.turnStage === 0 ? "roll_dice" : "end_turn"

  socket.emit("perform_game_action", { action },
  (err, data) => {
    if(err) notifyUser(err)
  })
})