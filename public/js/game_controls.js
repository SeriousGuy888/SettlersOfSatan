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




  tradePanel.style.display = currentGameData.turnCycle > 2 ? null : "none"

  offererNameP.textContent = currentGameData.players[currentGameData.turn].name
  offererNameP.style.color = currentGameData.players[currentGameData.turn].colour
  takerNameP.textContent = "Everyone"

  tradeButtonsDiv.style.display = null
  if(currentGameData.turn === currentGameData.me.id) {
    makeTradeButton.style.display = null
    takeTradeButton.style.display = "none"
  }
  else {
    makeTradeButton.style.display = "none"
    takeTradeButton.style.display = null
  }

  for(let resourceName in resourceDivNames) {
    const offererResourceInput = tradeOffererInputs.querySelector(`#trade-amount-input-${resourceName}`)
    const takerResourceInput = tradeTakerInputs.querySelector(`#trade-amount-input-${resourceName}`)

    if(currentGameData.turn === currentGameData.me.id) {
      offererResourceInput.disabled = false
      takerResourceInput.disabled = false

      noTradeOfferP.style.display = "none"
      tradeInterfaceDiv.style.display = null
    }
    else {
      if(currentGameData.trade.offer) {
        noTradeOfferP.style.display = "none"
        tradeInterfaceDiv.style.display = null

        offererResourceInput.disabled = true
        takerResourceInput.disabled = true
        offererResourceInput.value = currentGameData.trade.offer.offerer[resourceName] ?? 0
        takerResourceInput.value = currentGameData.trade.offer.taker[resourceName] ?? 0
      }
      else {
        tradeButtonsDiv.style.display = "none"
        noTradeOfferP.style.display = null
        tradeInterfaceDiv.style.display = "none"
      }
    }
  }
}

const tradeInterfaceDiv = document.querySelector("#trade-interface")
const noTradeOfferP = document.querySelector("#no-trade-offer")
const tradeButtonsDiv = document.querySelector("#trade-buttons")
const makeTradeButton = document.querySelector("#make-trade-button")
const takeTradeButton = document.querySelector("#take-trade-button")
const tradeOffererInputs = document.querySelector("#trade-offerer-inputs")
const tradeTakerInputs = document.querySelector("#trade-taker-inputs")
const offererNameP = document.querySelector("#trade-offerer-name")
const takerNameP = document.querySelector("#trade-taker-name")


makeTradeButton.addEventListener("click", () => {
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