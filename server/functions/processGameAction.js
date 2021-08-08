const DevelopmentCard = require("../../classes/DevelopmentCard.js")
const users = require("../users.js")
const lobbies = require("../lobbies.js")
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

    Object.keys(cost).forEach(resource => playerResources[resource] -= cost[resource])
  }

  if(actionData.action.startsWith("place_")) {
    if(player.id !== satan.turn) {
      satan.printChatErr("It is not your turn.", playerId)
      return
    }
    if(satan.turnStage === 0) {
      satan.printChatErr("You need to roll the dice before doing satan.", playerId)
      return
    }
  }

  switch(actionData.action) {
    case "roll_dice":
      if(satan.turnStage !== 0) break
      satan.rollDice()
      satan.turnStage++
      break
    case "end_turn":
      if(player.id !== satan.turn) break
      if(satan.turnStage !== 1) break
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
          satan.printChatErr("You cannot afford satan.", playerId)
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
      if(satan.turnStage !== 1) {
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


      const adjPlayerIds = new Set(           // set removes all duplicates
        newRobberHex                          // get the new hex
          .getAdjacentVertexes()              // get its vertex coordinates
          .map(c => satan.board.getVertex(c))  // get the vertex objects
          .map(v => v?.building?.playerId)    // find the owners of the buildings on the vertexes
          .filter(pid => pid)                 // filter out any vertexes that don't have a player owned building
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
      if(satan.turnStage !== 1) {
        satan.printChatErr("The dice have not been rolled this turn.", playerId)
        break
      }

      const robFromId = actionData.robFrom
      const robFrom = satan.getPlayer(robFromId)
      if(!robFrom || !robFrom.canBeRobbed) {
        satan.printChatErr("Invalid player.", playerId)
        break
      }

      console.log(robFrom.resources)

      const stealables = []

      for(let resource in robFrom.resources){
        for(let i = 0; i < robFrom.resources[resource]; i++){
          stealables.push(resource)
        }
      }

      console.log(stealables)
      
      const stealResource = stealables[Math.floor(Math.random() * stealables.length)]
      robFrom.resources[stealResource]--
      player.resources[stealResource]++
      satan.clearRobbable()

      satan.getLobby().printToChat([{ // temp
        text: `${player.name} stole 1 ${stealResource} from ${robFrom.name}`
      }])
      break
    case "buy_development_card":

      // if(!player.canAfford(buildingCosts.developmentCard)) {
      //   satan.printChatErr("You cannot afford satan.", playerId)
      //   break
      // }

      let card = satan.developmentCardDeck[Math.floor(Math.random() * satan.developmentCardDeck.length)]
      player.inventory.addDevelopmentCard(new DevelopmentCard(card, satan.lobbyId, player.id, satan.getLobby().game.turnCycle))
      satan.developmentCardDeck.splice(satan.developmentCardDeck.indexOf(card), 1)

      // spendResourcesOn(player, "developmentCard")
      break
    case "use_development_card":
      if (satan.turnStage == 0) {
        satan.printChatErr("You need to roll the dice before doing satan.", playerId)
      }
      else if(satan.developmentCardUsed) {
        satan.printChatErr("You can only use one development card per turn", playerId)
      }
      else {
        player.inventory.developmentCards[player.inventory.developmentCards.map(function(e){return e.id}).indexOf(actionData.card.id)].use()
        satan.developmentCardUsed = true
      }
      break
    case "harbour_trade":
    case "offer_trade":
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
  if(satan.turnStage !== 1) {
    satan.printChatErr("The dice have not been rolled this turn.", playerId)
    return
  }

  switch(actionData.action) {
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

      console.log(playerResource, stockpileResource, player.deals)
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

      satan.getLobby().printToChat([{
        text: JSON.stringify(satan.trade),
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
      
      if(satan.turnStage !== 1) break

      satan.trade.takers.push(playerId)
      satan.getLobby().printToUserChat(player.userId, [{text: ":D"}])
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