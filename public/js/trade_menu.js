const tradeInterfaceDiv = document.querySelector("#trade-interface")
const tradeButton = document.querySelector("#trade-button")
const tradeTakersList = document.querySelector("#trade-takers")
const tradeOffererInputs = tradeInterfaceDiv.querySelector("#trade-offerer-inputs")
const tradeTakerInputs = tradeInterfaceDiv.querySelector("#trade-taker-inputs")
const offererNameP = tradeInterfaceDiv.querySelector("#trade-offerer-name")
const takerSelect = tradeInterfaceDiv.querySelector("#trade-taker-select")

const tradeImg = document.querySelector("#trade-img")
const discardImg = document.querySelector("#discard-img")

const turnControls = document.querySelector("#turn-controls")

let tradeMode
let requiredDiscardCount = 0

const setTradeMode = (newMode) => {
  if(newMode) {
    takerSelect.value = newMode
    tradeMode = newMode
  }
  tradeMode = takerSelect.value
}

const refreshTradeMenu = () => {
  setTradeMode()
  requiredDiscardCount = currentGameData.discardingPlayers[currentGameData.me.id]

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


        inputElem.addEventListener("input", () => {
          const isZero = inputElem.value === "0" || !inputElem.value
          // const oppositeInput = (rightColumn ? tradeOffererInputs : tradeTakerInputs).querySelector(`input#${inputElem.id}`)

          if(tradeMode === "stockpile") {
            (rightColumn ? tradeTakerInputs : tradeOffererInputs).querySelectorAll("input").forEach(n => {
              if(inputElem === n) return
              if(isZero) n.disabled = false
              else {
                n.disabled = true
                n.value = "0"
              }
            })
          }
          if(tradeMode === "discard") {
            let total = 0
            tradeOffererInputs.querySelectorAll("input").forEach(n => total += parseInt(n.value) || 0)
            tradeButton.textContent = `Discard ${requiredDiscardCount} Cards (${total} selected)`
            tradeButton.disabled = total !== requiredDiscardCount
          }
        })
      }
  
      container.appendChild(frag)
    }
  }
  createTradeInputs(tradeOffererInputs, false)
  createTradeInputs(tradeTakerInputs, true)


  // disable the select menu if: there is an offer, the player is discarding, or if it is not the player's turn
  takerSelect.disabled = (currentGameData.trade.offer || requiredDiscardCount || currentGameData.turn !== currentGameData.me.id)

  if(requiredDiscardCount) {
    setTradeMode("discard")
  }
  else {
    if(tradeMode === "discard") setTradeMode("humans")
  }

  for(let resourceName in resourceDivNames) {
    const offererResourceInput = tradeOffererInputs.querySelector(`#trade-amount-input-${resourceName}`)
    const takerResourceInput = tradeTakerInputs.querySelector(`#trade-amount-input-${resourceName}`)

    if(currentGameData.turnTick) {
      offererResourceInput.value = "0"
      takerResourceInput.value = "0"
    }

    tradeButton.disabled = true
    tradeButton.textContent = "No trade offer..."
    tradeInterfaceDiv.style.display = "none"

    offererResourceInput.style.color = null
    takerResourceInput.style.color = null
    offererResourceInput.disabled = true
    takerResourceInput.disabled = true
    
    if(currentGameData.trade.offer) {
      const offererVal = currentGameData.trade.offer.offerer[resourceName] ?? 0
      const takerVal = currentGameData.trade.offer.taker[resourceName] ?? 0

      offererResourceInput.value = offererVal || null
      takerResourceInput.value = takerVal || null
    }
    else if(currentGameData.turn === currentGameData.me.id || requiredDiscardCount) {
      offererResourceInput.disabled = false
      takerResourceInput.disabled = false
    }
  }




  offererNameP.textContent = currentGameData.players[currentGameData.turn].name
  offererNameP.style.color = currentGameData.players[currentGameData.turn].colour
  // takerNameP.textContent = "Anyone"

  tradeTakersList.style.display = "none"

  if(
    currentGameData.currentAction !== "roll_dice" &&
    currentGameData.turnCycle > 2 &&
    (
      currentGameData.turn === currentGameData.me.id ||
      currentGameData.trade.offer ||
      requiredDiscardCount
    )
  ) {
    tradeButton.disabled = false
    tradeInterfaceDiv.style.display = null
    
    if(currentGameData.turn === currentGameData.me.id || requiredDiscardCount) {
      if(currentGameData.trade.offer) {
        tradeButton.textContent = "Cancel Trade Offer"
        tradeTakersList.style.display = null
      }
      else {
        tradeTakerInputs.style.display = null
        tradeImg.style.display = null
        discardImg.style.display = "none"
        switch(tradeMode) {
          case "humans":
            tradeButton.textContent = "Propose Trade"
            break
          case "stockpile":
            tradeButton.textContent = "Trade With Harbour"
            break
          case "discard":
            tradeButton.textContent = `Discard ${requiredDiscardCount} Cards`
            tradeButton.disabled = true
            tradeTakerInputs.style.display = "none"
            tradeImg.style.display = "none"
            discardImg.style.display = null
            break
        }
      }
    }
    else {
      tradeButton.textContent = "Accept Trade"
    }
  }
  else {
    tradeButton.textContent = currentGameData.turnCycle > 2 ? "Roll dice before trading..." : "Trading is not allowed right now..."
    tradeButton.disabled = true
    tradeInterfaceDiv.style.display = "none"
  }
}


takerSelect.addEventListener("change", () => {
  refreshTradeMenu()
})


tradeButton.addEventListener("click", () => {
  if(currentGameData.turn === currentGameData.me.id || requiredDiscardCount) {
    if(currentGameData.trade.offer) {
      socket.emit("perform_game_action", {
        action: "cancel_trade",
      }, (err, data) => {
        if(err) notifyUser(err)
      })
    }
    else {
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
    
      

      let action = "offer_trade"
      if(tradeMode === "stockpile") action = "harbour_trade"
      if(tradeMode === "discard") action = "discard_cards"
      socket.emit("perform_game_action", { action, offer }, (err, data) => {
        if(err) notifyUser(err)
      })
    }
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