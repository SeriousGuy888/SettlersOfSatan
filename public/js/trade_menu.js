const tradeInterfaceDiv = document.querySelector("#trade-interface")
const tradeButton = document.querySelector("#trade-button")
const tradeOffererInputs = document.querySelector("#trade-offerer-inputs")
const tradeTakerInputs = document.querySelector("#trade-taker-inputs")
const offererNameP = document.querySelector("#trade-offerer-name")
const takerSelect = document.querySelector("#trade-taker-select")
const tradeTakersList = document.querySelector("#trade-takers")

const turnControls = document.querySelector("#turn-controls")

let tradeMode
const refreshTradeMenu = () => {
  tradeMode = takerSelect.value // humans, stockpile, or discard
  
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
          const isZero = inputElem.value === "0"

          if(tradeMode === "humans") {
            const oppositeInput = (rightColumn ? tradeOffererInputs : tradeTakerInputs).querySelector(`input#${inputElem.id}`)
            
            if(isZero) oppositeInput.disabled = false
            else {
              oppositeInput.disabled = true
              oppositeInput.value = "0"
            }
          }
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
        })
      }
  
      container.appendChild(frag)
    }
  }
  createTradeInputs(tradeOffererInputs, false)
  createTradeInputs(tradeTakerInputs, true)



  offererNameP.textContent = currentGameData.players[currentGameData.turn].name
  offererNameP.style.color = currentGameData.players[currentGameData.turn].colour
  // takerNameP.textContent = "Anyone"

  tradeTakersList.style.display = "none"

  if(currentGameData.turnStage === 1 && currentGameData.turnCycle > 2) {
    if(currentGameData.turn === currentGameData.me.id) {
      if(currentGameData.trade.offer) {
        tradeButton.textContent = "Cancel Trade Offer"
        tradeTakersList.style.display = null
      }
      else {
        switch(tradeMode) {
          case "humans":
            tradeButton.textContent = "Propose Trade"
            break
          case "stockpile":
            tradeButton.textContent = "Trade With Harbour"
            break
          case "discard":
            tradeButton.textContent = "Discard Selected"
            break
        }
      }
    }
    else {
      tradeButton.textContent = "Accept Trade"
    }


    tradeButton.disabled = false
    tradeInterfaceDiv.style.display = null
  }
  else {
    tradeButton.textContent = currentGameData.turnCycle > 2 ? "Roll dice before trading..." : "Trading is not allowed right now..."
    tradeButton.disabled = true
    tradeInterfaceDiv.style.display = "none"
  }

  for(let resourceName in resourceDivNames) {
    const offererResourceInput = tradeOffererInputs.querySelector(`#trade-amount-input-${resourceName}`)
    const takerResourceInput = tradeTakerInputs.querySelector(`#trade-amount-input-${resourceName}`)

    if(currentGameData.turnTick) {
      offererResourceInput.value = "0"
      takerResourceInput.value = "0"
    }

    offererResourceInput.style.color = null
    takerResourceInput.style.color = null
    if(currentGameData.trade.offer) {
      offererResourceInput.disabled = true
      takerResourceInput.disabled = true
      const offererVal = currentGameData.trade.offer.offerer[resourceName] ?? 0
      const takerVal = currentGameData.trade.offer.taker[resourceName] ?? 0

      offererResourceInput.value = offererVal || null
      takerResourceInput.value = takerVal || null
    }
    else if(currentGameData.turn === currentGameData.me.id) {
      offererResourceInput.disabled = false
      takerResourceInput.disabled = false
    }
    else {
      tradeButton.disabled = true
      tradeButton.textContent = "No trade offer..."

      tradeInterfaceDiv.style.display = "none"
    }
  }
}


takerSelect.addEventListener("change", () => {
  refreshTradeMenu()
})


tradeButton.addEventListener("click", () => {
  if(currentGameData.turn === currentGameData.me.id) {
    if(currentGameData.trade.offer) {
      socket.emit("perform_game_action", {
        action: "cancel_trade",
      }, (err, data) => {
        if(err) notifyUser(err)
      })

      for(let resourceName in resourceDivNames) {
        const offererResourceInput = tradeOffererInputs.querySelector(`#trade-amount-input-${resourceName}`)
        const takerResourceInput = tradeTakerInputs.querySelector(`#trade-amount-input-${resourceName}`)
    
        offererResourceInput.value = "0"
        takerResourceInput.value = "0"
      }
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
    
      
      switch(tradeMode) {
        case "humans":
          socket.emit("perform_game_action", {
            action: "offer_trade",
            offer,
          }, (err, data) => {
            if(err) notifyUser(err)
          })
          break
        case "stockpile":
          socket.emit("perform_game_action", {
            action: "harbour_trade",
            offer,
          }, (err, data) => {
            if(err) notifyUser(err)
          })
          break
        // case "discard":
        //   socket.emit("perform_game_action", {
        //     action: "discard_trade",
        //     offer,
        //   }, (err, data) => {
        //     if(err) notifyUser(err)
        //   })
        //   break
      }
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