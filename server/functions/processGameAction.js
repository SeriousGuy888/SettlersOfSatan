const DevelopmentCard = require("../classes/DevelopmentCard.js")
const constants = require("../constants.js")
const { buildingCosts, hexTypesResources } = constants

module.exports = (satan, playerId, actionData) => {
  if(!actionData.action) return

  const coords = actionData.coords
  const coordsArr = actionData.coordsArr
  const vertex = satan.board.getVertex(coords)
  const player = satan.getPlayer(playerId)
  
  const spendResourcesOn = (p, item) => {
    const playerResources = p.resources
    const cost = buildingCosts[item]
    if(!playerResources || !cost) return false

    Object.keys(cost).forEach(resource => {
      satan.giveResources(p.id, resource, -cost[resource])
    })
  }

  if(actionData.action.startsWith("place_")) {
    if(player.id !== satan.turn) {
      satan.printChatErr("It is not your turn.", playerId)
      return
    }
    if(satan.currentAction === "roll_dice") {
      satan.printChatErr("You need to roll the dice before doing this.", playerId)
      return
    }
  }

  switch(actionData.action) {
    case "roll_dice":
      if(satan.currentAction !== "roll_dice") break
      satan.rollDice()
      break
    case "end_turn":
      if(player.id !== satan.turn) break
      if(satan.currentAction !== "build") break
      if(satan.inSetupTurnCycle()) {
        if(!satan.setupTurnPlaced.settlement) {
          satan.printChatErr("This is a setup turn. You must place a settlement before ending your turn.", playerId)
          break
        }
        if(!satan.setupTurnPlaced.road) {
          satan.printChatErr("This is a setup turn. You must place a road before ending your turn.", playerId)
          break
        }
      }
      if(satan.robbing) {
        satan.printChatErr("You must move the robber first.", playerId)
        break
      }
      if(Object.values(satan.players).some(p => p.canBeRobbed)) {
        satan.printChatErr("You must choose a player to rob in the playerlist first.", playerId)
        break
      }

      satan.nextTurn()
      break
    case "place_settlement":
      if(!vertex) break
      if(satan.inSetupTurnCycle()) {
        if(satan.setupTurnPlaced.settlement) {
          satan.printChatErr("This is a setup turn. You have already placed a settlement this turn.", playerId)
          break
        }
      }
      else {
        if(!player.canAfford(buildingCosts.settlement)) {
          satan.printChatErr("You cannot afford this.", playerId)
          break
        }
      }

      if(player.inventory.getSettlements() <= 0) {
        satan.printChatErr("You are out of settlements to place. You will need to upgrade some settlements to cities to get some settlements back.", playerId)
        break
      }

      if(vertex.getBuilding()?.type !== "settlement") {
        if(!vertex.allowPlacement) {
          satan.printChatErr("A settlement must be placed connected to one of your roads and at least two edges from any other settlement.", playerId)
          break
        }

        if(satan.inSetupTurnCycle()) {
          satan.setupTurnPlaced.settlement = vertex.coords
          
          if(satan.turnCycle === 2) {
            const adjacentHexes = vertex.getAdjacentHexes()
            for(const hexCoords of adjacentHexes) {
              const hex = satan.board.getHex(hexCoords.x, hexCoords.y)
              const resource = hexTypesResources[hex.resource]
              if(resource) {
                satan.giveResources(player.id, resource, 1)
              }
            }
          }
        }
        else {
          spendResourcesOn(player, "settlement")
        }
        
        vertex.setBuilding("settlement", playerId)
        player.points++
        player.inventory.addSettlement(-1)
      }
      break
    case "place_city":
      if(!vertex) break
      if(!player.canAfford(buildingCosts.city)) {
        satan.printChatErr("You cannot afford this.", playerId)
        break
      }
      if(player.inventory.getCities() <= 0) {
        satan.printChatErr("You are out of cities to place.", playerId)
        break
      }
      
      const existingBuilding = vertex.getBuilding()
      if(!existingBuilding) break
      if(existingBuilding.type === "settlement" && existingBuilding.playerId === playerId) {
        vertex.setBuilding("city", playerId)
        spendResourcesOn(player, "city")

        player.points++
        player.inventory.addCity(-1)
        player.inventory.addSettlement()
      }
      break
    case "place_road":
      const edge = satan.board.getEdge(coordsArr)
      if(!edge) break

      if(satan.inSetupTurnCycle()) {
        if(satan.setupTurnPlaced.road) {
          satan.printChatErr("This is a setup turn. You have already placed a road this turn.", playerId)
          break
        }
        if(!satan.setupTurnPlaced.settlement) {
          satan.printChatErr("This is a setup turn. You must place a settlement first.", playerId)
          break
        }
        if(!coordsArr.map(e => JSON.stringify(e)).includes(JSON.stringify(satan.setupTurnPlaced.settlement))) {
          satan.printChatErr("This is a setup turn. Your road must be connected to the settlement you placed this turn.", playerId)
          break
        }
      }
      else {
        if(!player.canAfford(buildingCosts.road) && !satan.roadBuilding) {
          satan.printChatErr("You cannot afford this.", playerId)
          break
        }
      }

      if(player.inventory.getRoads() <= 0) {
        satan.printChatErr("You are out of roads to place.", playerId)
        break
      }

      const vertexesConnectedToEdge = coordsArr.map(e => satan.board.getVertex(e))
      const connectedToOwnedVertex = vertexesConnectedToEdge.some(vert => vert.building && vert.building.playerId === playerId)
      let connectedToOwnedEdge = false

      for(const vert of vertexesConnectedToEdge) {
        const adjacentVertexes = vert.getAdjacentVertexes().map(v => satan.board.getVertex(v))
        const adjacentEdges = adjacentVertexes.map(vert2 => {
          if(!vert || !vert2) return
          return satan.board.getEdge([vert.coords, vert2.coords])
        })
        connectedToOwnedEdge = adjacentEdges.some(loopEdge => loopEdge?.road === playerId)
        if(connectedToOwnedEdge) break
      }

      // if the road is neither connected to an owned settlement nor connected to an owned edge
      if(!(connectedToOwnedVertex || connectedToOwnedEdge)) {
        satan.printChatErr("You can only place a road where it is connected to a settlement, city, or road that you own.", playerId)
        break
      }
      
      if(!edge.getRoad()) {
        edge.setRoad(playerId)
        if(satan.inSetupTurnCycle()) satan.setupTurnPlaced.road = edge.coordsArr
        else if(!satan.roadBuilding) spendResourcesOn(player, "road")
        player.inventory.addRoad(-1)
        if(satan.roadBuilding) satan.roadBuilding--
      }

      break
    case "move_robber":
      if(player.id !== satan.turn) {
        satan.printChatErr("It is not your turn.", playerId)
        break
      }
      if(satan.currentAction === "roll_dice") {
        satan.printChatErr("The dice have not been rolled this turn.", playerId)
        break
      }
      if(!satan.robbing) {
        satan.printChatErr("The robber cannot be moved this turn or has already been moved.", playerId)
        break
      }

      const newRobberHex = satan.board.getHex(coords.x, coords.y)

      if(!newRobberHex || newRobberHex.invisible) {
        satan.printChatErr("Invalid coordinates provided.", playerId)
        break
      }
      if(newRobberHex.robber) {
        satan.printChatErr("The robber must be moved to a different hex.", playerId)
        break
      }
      satan.board.moveRobber(coords.x, coords.y)
      satan.robbing = false


      const adjPlayerIds = new Set(                                   // set removes all duplicates
        newRobberHex                                                  // get the new hex
          .getAdjacentVertexes()                                      // get its vertex coordinates
          .map(c => satan.board.getVertex(c))                         // get the vertex objects
          .map(v => v?.building?.playerId)                            // find the owners of the buildings on the vertexes
          .filter(pid => pid && !satan.getPlayer(pid).disconnected)   // filter out any vertexes that don't have a player owned building
      )
      
      adjPlayerIds.forEach(pid => {
        if(pid === player.id) return
        
        const robberyCandidate = satan.getPlayer(pid)
        const resourceCardCount = Object.values(robberyCandidate.resources).reduce((prev, accu) => prev += accu)
        if(resourceCardCount <= 0) return
        robberyCandidate.canBeRobbed = true
      })
      break
    case "rob_player":
      if(player.id !== satan.turn) {
        satan.printChatErr("It is not your turn.", playerId)
        break
      }
      if(satan.currentAction === "roll_dice") {
        satan.printChatErr("The dice have not been rolled this turn.", playerId)
        break
      }

      const robFromId = actionData.robFrom
      const robFrom = satan.getPlayer(robFromId)
      if(!robFrom || !robFrom.canBeRobbed) {
        satan.printChatErr("Invalid player.", playerId)
        break
      }

      const steal = robFrom.drawResourceCards(1)
      for(const resource in steal) {
        if(!steal[resource]) continue
        robFrom.resources[resource] -= steal[resource]
        player.resources[resource] += steal[resource]
      }
      satan.getLobby().printToChat([{ // temp
        text: `${player.name} stole a card from ${robFrom.name}`
      }])
      
      satan.clearRobbable()
      break
    case "buy_development_card":

      // if(!player.canAfford(buildingCosts.developmentCard)) {
      //   satan.printChatErr("You cannot afford this.", playerId)
      //   break
      // }

      let card = satan.developmentCardDeck[Math.floor(Math.random() * satan.developmentCardDeck.length)]
      player.inventory.addDevelopmentCard(new DevelopmentCard(card, satan.lobbyId, player.id, satan.getLobby().game.turnCycle))
      satan.developmentCardDeck.splice(satan.developmentCardDeck.indexOf(card), 1)

      // spendResourcesOn(player, "developmentCard")
      break
    case "use_development_card":
      if(satan.currentAction === "roll_dice") {
        satan.printChatErr("You need to roll the dice before doing this.", playerId)
      }
      else if(satan.developmentCardUsed) {
        satan.printChatErr("You can only use one development card per turn", playerId)
      }
      else {
        player.inventory.developmentCards[player.inventory.developmentCards.map(function(e){return e.id}).indexOf(actionData.card.id)].use()
        satan.developmentCardUsed = true
      }
      break
    case "discard_cards":
    case "harbour_trade":
    case "offer_trade":
    case "year_of_plenty":
    case "accept_trade":
    case "confirm_trade":
    case "cancel_trade":
      handleTradeActions(satan, playerId, actionData)
      break
    default:
      return
  }
  
  satan.refreshAllowedPlacements()
}

const handleTradeActions = (satan, playerId, actionData) => {
  const player = satan.getPlayer(playerId)
  
  const sanitiseTradeOffer = (unsanitisedOffer) => {
    // sanitise the incoming offer data to make sure everything is a number
    const resourceNames = ["bricks", "lumber", "wool", "wheat", "ore"]
    if(!unsanitisedOffer) return
    const { offerer, taker } = unsanitisedOffer
    const sanitised = {
      offerer: {},
      taker: {}
    }
    for(let resource of resourceNames) {
      const minAmt = 0
      sanitised.offerer[resource] = Math.max(parseInt(offerer[resource]) || 0, minAmt)
      sanitised.taker[resource] = Math.max(parseInt(taker[resource]) || 0, minAmt)
    }
    return sanitised
  }

  const sanitisedOffer = sanitiseTradeOffer(actionData.offer)


  if(satan.inSetupTurnCycle()) {
    satan.printChatErr("Trading is not allowed during setup turns.", playerId)
    return
  }
  if(satan.currentAction === "roll_dice") {
    satan.printChatErr("The dice have not been rolled this turn.", playerId)
    return
  }

  switch(actionData.action) {
    case "discard_cards":
      if(!satan.discardingPlayers[player.id]) {
        satan.printChatErr("You are not allowed to discard at this time.", playerId)
        break
      }
      if(!player.canAfford(sanitisedOffer.offerer)) {
        satan.printChatErr("You do not have these cards to discard.", playerId)
        break
      }

      const requiredCardCount = satan.discardingPlayers[player.id]
      const discardingCardCount = Object.values(sanitisedOffer.offerer).reduce((prev, curr) => prev + curr)
      if(discardingCardCount !== requiredCardCount) {
        satan.printChatErr(`You are attempting to discard ${discardingCardCount} cards, but you must discard exactly ${requiredCardCount} cards.`, playerId)
        break
      }

      for(const resource in sanitisedOffer.offerer) {
        satan.giveResources(player.id, resource, -sanitisedOffer.offerer[resource])
      }

      satan.getLobby().printToChat([{
        text: `${player.name} has discarded ${discardingCardCount} cards.`,
        style: { colour: "brown" }
      }])
      delete satan.discardingPlayers[player.id]
      break
    case "year_of_plenty":
      if(!satan.yearOfPlenty) {
        satan.printChatErr("im not giving you any free cards lol", playerId)
        break
      }
      if(!satan.stockpileCanAfford(sanitisedOffer.taker)) {
        satan.printChatErr("The bank does not have enough of the cards you want.", playerId)
        break
      }

      const takingCardCount = Object.values(sanitisedOffer.taker).reduce((prev, curr) => prev + curr)
      if(takingCardCount !== satan.yearOfPlenty) {
        satan.printChatErr(`You are attempting to take ${takingCardCount} cards, but you must take exactly ${satan.yearOfPlenty} cards.`, playerId)
        break
      }

      for(const resource in sanitisedOffer.offerer) {
        satan.giveResources(player.id, resource, sanitisedOffer.taker[resource])
      }

      satan.getLobby().printToChat([{
        text: `${player.name} has taken ${takingCardCount} cards from the bank using a year of plenty development card.`,
        style: { colour: "brown" }
      }])
      satan.yearOfPlenty = 0
      break
    case "harbour_trade":
      if(player.id !== satan.turn) {
        satan.printChatErr("It is not your turn.", playerId)
        break
      }
      if(!player.canAfford(sanitisedOffer.offerer)) {
        satan.printChatErr("You do not have the resources necessary for this trade.", playerId)
        break
      }

      const playerResource = Object.keys(sanitisedOffer.offerer).filter(k => sanitisedOffer.offerer[k] > 0)[0]
      const stockpileResource = Object.keys(sanitisedOffer.taker).filter(k => sanitisedOffer.taker[k] > 0)[0]

      if(!playerResource || !stockpileResource) {
        satan.printChatErr("Trade amounts ung kan bea zero.", playerId)
        break
      }
      if(playerResource === stockpileResource) {
        satan.printChatErr("Qwat? Qwy dz yu wishtu trade for ce same resourse qwich yu bea offering?????????", playerId)
        break
      }

      const { deals } = player
      const eligibleDeals = deals.filter(deal => ( // find all the deals that the offered resources would fulfill
        (deal.resource === "any" || deal.resource === playerResource) &&
        sanitisedOffer.offerer[playerResource] >= deal.amount
      ))

      if(!eligibleDeals.length) {
        satan.printChatErr("None of your harbours were interested in your offer.", playerId)
        break
      }


      const bestDeal = eligibleDeals.reduce((prev, curr) => prev.amount < curr.amount ? prev : curr) // finds deal with lowest amount

      const stockpileAmount = sanitisedOffer.taker[stockpileResource]
      const playerAmount = stockpileAmount * bestDeal.amount // reverses stockpileAmount but with the floored amount
      
      if(sanitisedOffer.offerer[playerResource] < playerAmount) {
        satan.printChatErr(`You will need to offer ${playerAmount} ${playerResource.toUpperCase()} for this trade to be accepted.`, playerId)
        break
      }

      satan.giveResources(player.id, stockpileResource, stockpileAmount)
      satan.giveResources(player.id, playerResource, -playerAmount)
      satan.getLobby().printToChat([{
        text: `${player.name} traded with the bank: ${playerAmount} ${playerResource.toUpperCase()} for ${stockpileAmount} ${stockpileResource.toUpperCase()}.`,
        style: { colour: "brown" }
      }])
      break
    case "offer_trade":
      if(player.id !== satan.turn) {
        satan.printChatErr("It is not your turn.", playerId)
        break
      }
      if(!player.canAfford(sanitisedOffer.offerer)) {
        satan.printChatErr("You do not have the resources necessary for this trade.", playerId)
        break
      }

      satan.trade.offer = sanitisedOffer
      satan.trade.takers = []
      satan.trade.idempotency = Date.now()

      const getTradeChatAnnouncement = () => {
        const listifyObj = obj => Object
          .keys(obj)
          .filter(k => obj[k] > 0)
          .map(k => `${obj[k]} ${k.toUpperCase()}`)
          .join(", ")
        const offererStr = listifyObj(satan.trade.offer.offerer) || "nothing"
        const takerStr = listifyObj(satan.trade.offer.taker) || "free"

        return `${player.name} offers ${offererStr} for ${takerStr}.`
      }

      satan.getLobby().printToChat([{
        text: getTradeChatAnnouncement(),
        style: { colour: "brown" }
      }])
      break
    case "accept_trade":
      if(!satan.trade.offer || actionData.idempotency !== satan.trade.idempotency) {
        satan.printChatErr("This trade offer does not exist or has expired.", playerId)
        break
      }
      if(playerId === satan.turn) {
        satan.printChatErr("You cannot accept your own trade.", playerId)
        break
      }
      if(satan.trade.takers.includes(playerId)) {
        satan.printChatErr("You've already accepted this trade. Please wait for the offerer to decide.", playerId)
        break
      }
      if(!satan.getPlayer(playerId).canAfford(satan.trade.offer.taker)){
        satan.printChatErr("You cannot afford this trade.", playerId)
        break
      }
      
      if(satan.currentAction === "roll_dice") break

      satan.trade.takers.push(playerId)
      satan.getLobby().printToUserChat(player.userId, [{
        text: "You've accepted this trade. Please wait for the offerer to choose someone to finalise the trade with.",
        style: { colour: "brown" }
      }])
      break
    case "confirm_trade":
      if(player.id !== satan.turn) {
        satan.printChatErr("It is not your turn.", playerId)
        break
      }
      if(!satan.trade.offer) {
        satan.printChatErr("There is no trade to confirm.", playerId)
        break
      }

      const tradeTakerId = actionData.tradeWith
      if(!satan.trade.takers.includes(tradeTakerId)) {
        satan.printChatErr("This player has not accepted the trade offer.", playerId)
        break
      }

      const tradeTaker = satan.getPlayer(tradeTakerId)
      if(!tradeTaker) break

      satan.finishTrade(satan.trade.offer, satan.getPlayer(satan.turn), tradeTaker)
      satan.clearTrade()
      break
    case "cancel_trade":
      if(player.id !== satan.turn) {
        satan.printChatErr("It is not your turn.", playerId)
        break
      }
      if(!satan.trade.offer) {
        satan.printChatErr("There is no trade to cancel.", playerId)
        break
      }

      satan.clearTrade()
      satan.getLobby().printToChat([{
        text: `${player.name} has cancelled their trade offer.`,
        style: { colour: "brown" }
      }])
      break
    default:
      return
  }
}