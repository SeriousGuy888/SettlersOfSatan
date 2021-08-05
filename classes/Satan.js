const Board = require("./Board.js")
const DevelopmentCard = require("./DevelopmentCard.js")

const lobbies = require("../server/lobbies.js")
const users = require("../server/users.js")
const constants = require("../constants.js")

const { buildingCosts } = constants

const hexTypesResources = {
  mud: "bricks",
  forest: "lumber",
  mountain: "ore",
  farm: "wheat",
  pasture: "wool",
  desert: null
}

class Satan {
  constructor(lobbyId) {
    this.lobbyId = lobbyId
    this.players = {}
    
    this.board = new Board()

    this.turn = null // stores the player id of the currently playing playeur
    this.turnCycle = 0 // how many times every player has been given a turn
    this.turnStage = 0 // turn stage manages whether the dice have been rolled
    this.turnTick = false // set to true when the turn has changed and set to false after the next tick (notifies clients of turn changes)
    this.turnCountdownTo = null // a timestamp that when passed, the present turn will be forcefully passed
    this.setupTurnPlaced = { // stores the coordinates of the pieces placed this setup turn
      settlement: null,
      road: null,
    }

    this.trade = {
      offer: null,
      takers: [],
      idempotency: null
    }

    this.robbing = false

    const developmentCardAmounts = {
      "knight": 14,
      "road building": 2,
      "year of plenty": 2,
      "monopoly": 2,
    }

    this.developmentCardDeck = ["library", "market", "chapel", "great hall", "university"]

    for(const card in developmentCardAmounts) {
      for(let i = 0; i < developmentCardAmounts[card]; i++){
        this.developmentCardDeck.push(card)
      }
    }
  }

  tick() {
    const lobby = lobbies.getLobby(this.lobbyId)
    
    if(!this.turn || this.getPlayer(this.turn).disconnected) { // no turn is set or current player has disconnected
      this.nextTurn()
    }
    if(this.turnCountdownTo - Date.now() < 0) { // time limit for the turn has passed
      lobbies.getLobby(this.lobbyId).printToChat([{
        text: `${this.getPlayer(this.turn).name}'s turn was skipped because they took too much time.`,
        style: {
          colour: "green"
        }
      }])
      this.nextTurn()
    }


    let playersPublicData = {}
    for(let i in this.players) {
      playersPublicData[i] = this.players[i].getPublicData()
    }
    
    const tickData = {
      board: this.board,
      players: playersPublicData,
      turn: this.turn,
      turnCycle: this.turnCycle,
      turnStage: this.turnStage,
      turnTick: this.turnTick,
      turnCountdownTo: this.turnCountdownTo,
      trade: this.trade,
      robbing: this.robbing,
      developmentCardDeck: this.developmentCardDeck
    }

    if(JSON.stringify(tickData) !== this.prevTickData) {
      lobby.broadcast("game_update", tickData)
      this.prevTickData = JSON.stringify(tickData)
    }

    if(this.turnTick) this.turnTick = false
  }

  getPlayers() {
    return this.players
  }

  getPlayer(playerId) {
    return this.players[playerId]
  }

  setPlayer(playerId, data) {
    if(!data) delete this.players[playerId]
    else this.players[playerId] = data
  }

  getBoard() {
    return this.board
  }

  handleWin() {
    const lobby = lobbies.getLobby(this.lobbyId)
    const currentPlayer = this.getPlayer(this.turn)
    if(currentPlayer.points < 10) return

    lobby.printToChat([{
      text: `${currentPlayer.name} has reached ten victory points and won the game 🎉 but billzo has not coded the stuff for ending a game`,
      style: { colour: "magenta", bold: true }
    }])
  }

  processAction(playerId, actionData) {
    const action = actionData.action
    if(!action) return

    const coords = actionData.coords
    const coordsArr = actionData.coordsArr
    const vertex = this.board.getVertex(coords)
    const player = this.getPlayer(playerId)
    const user = users.getUser(player.userId)
    const lobby = lobbies.getLobby(user.lobbyId)

    const printChatErr = (msg) => {
      lobby.printToUserChat(user.id, [{
        text: msg,
        style: {
          colour: "red",
          italic: true,
        }
      }])
    }
    
    const spendResourcesOn = (p, item) => {
      const playerResources = p.resources
      const cost = buildingCosts[item]
      if(!playerResources || !cost) return false

      Object.keys(cost).forEach(resource => playerResources[resource] -= cost[resource])
    }

    if(action.startsWith("place_")) {
      if(player.id !== this.turn) {
        printChatErr("It is not your turn.")
        return
      }
      if(this.turnStage === 0) {
        printChatErr("You need to roll the dice before doing this.")
        return
      }
    }

    switch(action) {
      case "roll_dice":
        if(this.turnStage !== 0) break
        this.rollDice()
        this.turnStage++
        break
      case "end_turn":
        if(player.id !== this.turn) break
        if(this.turnStage !== 1) break
        if(this.inSetupTurnCycle()) {
          if(!this.setupTurnPlaced.settlement) {
            printChatErr("This is a setup turn. You must place a settlement before ending your turn.")
            break
          }
          if(!this.setupTurnPlaced.road) {
            printChatErr("This is a setup turn. You must place a road before ending your turn.")
            break
          }
        }
        if(this.robbing) {
          printChatErr("You must move the robber first.")
          break
        }
        if(Object.values(this.players).some(p => p.canBeRobbed)) {
          printChatErr("You must choose a player to rob in the playerlist first.")
          break
        }

        this.nextTurn()
        break
      case "place_settlement":
        if(!vertex) break
        if(this.inSetupTurnCycle()) {
          if(this.setupTurnPlaced.settlement) {
            printChatErr("This is a setup turn. You have already placed a settlement this turn.")
            break
          }
        }
        else {
          if(!player.canAfford(buildingCosts.settlement)) {
            printChatErr("You cannot afford this.")
            break
          }
        }

        if(player.inventory.getSettlements() <= 0) {
          printChatErr("You are out of settlements to place. You will need to upgrade some settlements to cities to get some settlements back.")
          break
        }

        if(vertex.getBuilding()?.type !== "settlement") {
          if(!vertex.allowPlacement) {
            printChatErr("A settlement must be placed connected to one of your roads and at least two edges from any other settlement.")
            break
          }

          if(this.inSetupTurnCycle()) {
            this.setupTurnPlaced.settlement = vertex.coords
            
            if(this.turnCycle === 2) {
              const adjacentHexes = vertex.getAdjacentHexes()
              for(const hexCoords of adjacentHexes) {
                const hex = this.board.getHex(hexCoords.x, hexCoords.y)
                const resource = hexTypesResources[hex.resource]
                if(resource) {
                  player.resources[resource]++
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
          this.refreshAllowedPlacements()
        }
        break
      case "place_city":
        if(!vertex) break
        if(!player.canAfford(buildingCosts.city)) {
          printChatErr("You cannot afford this.")
          break
        }
        if(player.inventory.getCities() <= 0) {
          printChatErr("You are out of cities to place.")
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
          this.refreshAllowedPlacements()
        }
        break
      case "place_road":
        const edge = this.board.getEdge(coordsArr)
        if(!edge) break

        if(this.inSetupTurnCycle()) {
          if(this.setupTurnPlaced.road) {
            printChatErr("This is a setup turn. You have already placed a road this turn.")
            break
          }
          if(!this.setupTurnPlaced.settlement) {
            printChatErr("This is a setup turn. You must place a settlement first.")
            break
          }
          if(!coordsArr.map(e => JSON.stringify(e)).includes(JSON.stringify(this.setupTurnPlaced.settlement))) {
            printChatErr("This is a setup turn. Your road must be connected to the settlement you placed this turn.")
            break
          }
        }
        else {
          if(!player.canAfford(buildingCosts.road)) {
            printChatErr("You cannot afford this.")
            break
          }
        }

        if(player.inventory.getRoads() <= 0) {
          printChatErr("You are out of roads to place.")
          break
        }

        const vertexesConnectedToEdge = coordsArr.map(e => this.board.getVertex(e))
        const connectedToOwnedVertex = vertexesConnectedToEdge.some(vert => vert.building && vert.building.playerId === playerId)
        let connectedToOwnedEdge = false

        for(const vert of vertexesConnectedToEdge) {
          const adjacentVertexes = vert.getAdjacentVertexes().map(v => this.board.getVertex(v))
          const adjacentEdges = adjacentVertexes.map(vert2 => {
            if(!vert || !vert2) return
            return this.board.getEdge([vert.coords, vert2.coords])
          })
          connectedToOwnedEdge = adjacentEdges.some(loopEdge => loopEdge?.road === playerId)
          if(connectedToOwnedEdge) break
        }

        // if the road is neither connected to an owned settlement nor connected to an owned edge
        if(!(connectedToOwnedVertex || connectedToOwnedEdge)) {
          printChatErr("You can only place a road where it is connected to a settlement, city, or road that you own.")
          break
        }
        
        if(!edge.getRoad()) {
          edge.setRoad(playerId)
          if(this.inSetupTurnCycle()) this.setupTurnPlaced.road = edge.coordsArr
          else                        spendResourcesOn(player, "road")
          player.inventory.addRoad(-1)
          this.refreshAllowedPlacements()
        }

        break
      case "move_robber":
        if(player.id !== this.turn) {
          printChatErr("It is not your turn.")
          break
        }
        if(this.turnStage !== 1) {
          printChatErr("The dice have not been rolled this turn.")
          break
        }
        if(!this.robbing) {
          printChatErr("The robber cannot be moved this turn or has already been moved.")
          break
        }
        if(!this.board.getHex(coords.x, coords.y)) {
          printChatErr("Invalid coordinates provided.")
          break
        }
        if(this.board.getHex(coords.x, coords.y).robber) {
          printChatErr("The robber must be moved to a different hex.")
          break
        }

        const currentRobberHex = this.board.getRobberHex()
        const newRobberHex = this.board.getHex(coords.x, coords.y)

        if(currentRobberHex) currentRobberHex.robber = false
        newRobberHex.robber = true
        this.robbing = false


        const adjPlayerIds = new Set(           // set removes all duplicates
          newRobberHex                          // get the new hex
            .getAdjacentVertexes()              // get its vertex coordinates
            .map(c => this.board.getVertex(c))  // get the vertex objects
            .map(v => v?.building?.playerId)    // find the owners of the buildings on the vertexes
            .filter(pid => pid)                 // filter out any vertexes that don't have a player owned building
        )
        
        adjPlayerIds.forEach(pid => {
          if(pid === player.id) return
          
          const robberyCandidate = this.getPlayer(pid)
          const resourceCardCount = Object.values(robberyCandidate.resources).reduce((prev, accu) => prev += accu)
          if(resourceCardCount <= 0) return
          robberyCandidate.canBeRobbed = true
        })
        break
      case "rob_player":
        if(player.id !== this.turn) {
          printChatErr("It is not your turn.")
          break
        }
        if(this.turnStage !== 1) {
          printChatErr("The dice have not been rolled this turn.")
          break
        }

        const robFromId = actionData.robFrom
        const robFrom = this.getPlayer(robFromId)
        if(!robFrom || !robFrom.canBeRobbed) {
          printChatErr("Invalid player.")
          break
        }

        const stealables = Object.keys(robFrom.resources).filter(k => robFrom.resources[k] > 0)
        const stealResource = stealables[Math.floor(Math.random() * stealables.length)]
        robFrom.resources[stealResource]--
        player.resources[stealResource]++
        this.clearRobbable()

        lobbies.getLobby(this.lobbyId).printToChat([{ // temp
          text: `${player.name} stole 1 ${stealResource} from ${robFrom.name}`
        }])
        break
      case "buy_development_card":

        // if(!player.canAfford(buildingCosts.developmentCard)) {
        //   printChatErr("You cannot afford this.")
        //   break
        // }

        let card = this.developmentCardDeck[Math.floor(Math.random() * this.developmentCardDeck.length)]
        player.inventory.addDevelopmentCard(new DevelopmentCard(card, this.lobbyId, player.id, lobbies.getLobby(this.lobbyId).game.turnCycle))
        this.developmentCardDeck.splice(this.developmentCardDeck.indexOf(card), 1)

        // spendResourcesOn(player, "developmentCard")
        break

      case "offer_trade":
        if(player.id !== this.turn) {
          printChatErr("It is not your turn.")
          break
        }
        if(this.inSetupTurnCycle()) {
          printChatErr("Trading is not allowed during setup turns.")
          break
        }
        if(this.turnStage !== 1) {
          printChatErr("The dice have not been rolled this turn.")
          break
        }



        // sanitise the incoming offer data to make sure everything is a number
        const resourceNames = ["bricks", "lumber", "wool", "wheat", "ore"]
        const unsanitisedOffer = actionData.offer
        const { offerer, taker } = unsanitisedOffer

        const sanitisedOffer = {
          offerer: {},
          taker: {}
        }

        for(let resource of resourceNames) {
          const maxAmt = 7
          const minAmt = 0
          sanitisedOffer.offerer[resource] = Math.max(Math.min(parseInt(offerer[resource]) || 0, maxAmt), minAmt)
          sanitisedOffer.taker[resource] = Math.max(Math.min(parseInt(taker[resource]) || 0, maxAmt), minAmt)
        }

        if(!player.canAfford(sanitisedOffer.offerer)) {
          printChatErr("You do not have the resources necessary for this trade.")
          break
        }


        this.trade.offer = sanitisedOffer
        this.trade.takers = []
        this.trade.idempotency = Date.now()

        lobby.printToChat([{
          text: JSON.stringify(this.trade),
          style: { colour: "brown" }
        }])
        break
      case "accept_trade":
        if(this.inSetupTurnCycle()) break

        if(!this.trade.offer || actionData.idempotency !== this.trade.idempotency) {
          printChatErr("This trade offer does not exist or has expired.")
          break
        }
        if(playerId === this.turn) {
          printChatErr("You cannot accept your own trade.")
          break
        }
        if(this.trade.takers.includes(playerId)) {
          printChatErr("You've already accepted this trade. Please wait for the offerer to decide.")
          break
        }
        if(!this.getPlayer(playerId).canAfford(this.trade.offer.taker)){
          printChatErr("You cannot afford this trade.")
          break
        }
        
        if(this.turnStage !== 1) break

        this.trade.takers.push(playerId)
        lobby.printToUserChat(player.userId, [{text: ":D"}])
        break
      case "confirm_trade":
        if(player.id !== this.turn) {
          printChatErr("It is not your turn.")
          break
        }
        if(!this.trade.offer) {
          printChatErr("There is no trade to confirm.")
          break
        }

        const tradeTakerId = actionData.tradeWith
        if(!this.trade.takers.includes(tradeTakerId)) {
          printChatErr("This player has not accepted the trade offer.")
          break
        }

        const tradeTaker = this.getPlayer(tradeTakerId)
        if(!tradeTaker) break

        this.finishTrade(this.trade.offer, this.getPlayer(this.turn), tradeTaker)
        this.clearTrade()
        break
      case "cancel_trade":
        if(player.id !== this.turn) {
          printChatErr("It is not your turn.")
          break
        }
        if(!this.trade.offer) {
          printChatErr("There is no trade to cancel.")
          break
        }

        this.clearTrade()
        lobby.printToChat([{
          text: `${player.name} has cancelled their trade offer.`,
          style: { colour: "brown" }
        }])
        break
      default:
        return
    }
  }

  finishTrade(deal, party1, party2) {
    const { offerer, taker } = deal

    const printNoRes = (human) => {
      lobbies.getLobby(this.lobbyId).printToChat([{
        text: `${human.name} did not have the resources needed for the trade.`,
        style: { colour: "red", italic: true }
      }])
    }

    if(!party1.canAfford(offerer)) {
      printNoRes(party1)
      return
    }
    if(!party2.canAfford(taker)) {
      printNoRes(party2)
      return
    }
    
    for(let i in offerer) {
      party1.resources[i] -= offerer[i]
      party1.resources[i] += taker[i]
    }
    for(let i in taker) {
      party2.resources[i] -= taker[i]
      party2.resources[i] += offerer[i]
    }
  }

  clearRobbable() {
    Object.values(this.players)
      .forEach(p => {
        p.canBeRobbed = false
      })
  }

  clearTrade() {
    this.trade.offer = null
    this.trade.takers = []
    this.trade.idempotency = null
  }

  refreshAllowedPlacements() {
    // refresh places where stuff can be placed
    this.board.vertexes.forEach(vertex => {
      vertex.allowPlacement = true

      const adjEdges = []
      for(let adjVertCoords of vertex.getAdjacentVertexes()) {
        const adjVert = this.board.getVertex(adjVertCoords)
        if(!adjVert) continue
        if(adjVert.getBuilding()) vertex.allowPlacement = false // distance rule
        adjEdges.push(this.board.getEdge([vertex.coords, adjVertCoords]))
      }

      if(this.inSetupTurnCycle()) {
        if(this.setupTurnPlaced.settlement) {
          vertex.allowPlacement = false
        }
      }
      else {
        if(adjEdges.every(loopEdge => loopEdge.road !== this.turn)) {
          vertex.allowPlacement = false
        }
      }
    })
    this.board.edges.forEach(edge => {
      const connectedVertexes = edge.coordsArr.map(c => this.board.getVertex(c))
      if(connectedVertexes.some(v => v === undefined)) return

      edge.allowPlacement = false

      if(this.inSetupTurnCycle()) {
        if(!this.setupTurnPlaced.road && connectedVertexes.some(v => v.coords === this.setupTurnPlaced.settlement)) {
          edge.allowPlacement = true
        }
      }
      else {
        if(connectedVertexes.some(v => v.getBuilding()?.playerId === this.turn)) {
          edge.allowPlacement = true
        }

        connectedVertexes.forEach(vertex => {
          for(let adjVertCoords of vertex.getAdjacentVertexes()) {
            const adjEdge = this.board.getEdge([vertex.coords, adjVertCoords])
            if(!adjEdge) continue
            if(adjEdge.getRoad() === this.turn) edge.allowPlacement = true
          }
        })
      }
    })

    
    // refresh whether the buttons are enabled for a player
    // (based on whether the player can afford it and whether there is anywhere to place something)
    const player = this.getPlayer(this.turn)
    for(let buildingName in buildingCosts) {
      let enable = false

      if(this.inSetupTurnCycle()) {
        enable = (["settlement", "road"].includes(buildingName))
      }
      else {
        enable = player.canAfford(buildingCosts[buildingName])
      }

      if(enable) {
        if(buildingName === "settlement") enable = this.board.vertexes.some(v => v.allowPlacement && !v.building)
        if(buildingName === "city")       enable = this.board.vertexes.some(v => v.building?.playerId === player.id)
        if(buildingName === "road")       enable = this.board.edges.some(e => e.allowPlacement)
      }

      player.enableControls[buildingName] = enable
    }
  }

  nextTurn() {
    const reversedCycle = this.turnCycle === 2
    const reversedCycleIsNext = this.turnCycle === 2 - 1
    // the second setup round is played in reverse order

    const playerIds = Object.keys(this.players)
    const sortedPlayerIds = playerIds.sort((a, b) => this.players[a].joinTimestamp - this.players[b].joinTimestamp)
    const firstOfNextCycle = reversedCycleIsNext ? sortedPlayerIds[sortedPlayerIds.length - 1] : sortedPlayerIds[0]

    const nextTurnAddend = reversedCycle ? -1 : 1 // go backwards if this is a reversed turn cycle

    const currentIndex = sortedPlayerIds.indexOf(this.turn)

    this.robbing = false

    if(currentIndex === -1 || !playerIds[currentIndex + nextTurnAddend]) { // there is no turn right now or the current turn is the last player
      this.turn = firstOfNextCycle
      this.turnCycle++

      if(reversedCycleIsNext) lobbies.getLobby(this.lobbyId).printToChat([{
        text: "This setup round is played in reverse. The last player gets to place another settlement and road.",
        style: { colour: "green" },
      }])
    }
    else {
      this.turn = playerIds[currentIndex + nextTurnAddend]
    }

    if(this.players[this.turn].disconnected) {
      this.nextTurn()
    }
    else {
      this.turnStage = 0
      this.turnTick = true
      this.turnCountdownTo = new Date().setTime(new Date().getTime() + 120 * 1000)

      this.clearTrade()
      this.clearRobbable()

      if(this.inSetupTurnCycle()) {
        this.setupTurnPlaced.settlement = null
        this.setupTurnPlaced.road = null
        this.turnStage = 1
      }

      this.refreshAllowedPlacements()
      this.handleWin()

      lobbies.getLobby(this.lobbyId).printToChat([{
        text: `It is now ${this.players[this.turn].name}'s turn.`,
        style: { colour: "green" },
      }])
    }
  }
  inSetupTurnCycle() {
    return (this.turnCycle <= 2)
  }


  rollDice() {
    let dice1 = Math.floor(Math.random() * 6) + 1
    let dice2 = Math.floor(Math.random() * 6) + 1
    let number = dice1 + dice2

    lobbies.getLobby(this.lobbyId).printToChat([{
      text: `${this.players[this.turn].name} rolled ${number}`,
      dice: [dice1, dice2],
      style: {
        colour: "purple",
      },
    }])

    if (number == 7) {
      this.moveRobber()
    }

    else {
      this.robbing = false
      for(const vertex of this.board.vertexes) {
        const building = vertex.getBuilding()
        if(!building) continue

        const adjacentHexes = vertex.getAdjacentHexes()
        const player = this.getPlayer(building.playerId)
        if(!player) continue

        for(const hexCoords of adjacentHexes) {
          const hex = this.board.getRow(hexCoords.y)[hexCoords.x]

          if(hex.robber) continue

          const resource = hexTypesResources[hex.resource]
          if(resource && hex.number === number) {
            if(building.type === "city") {
              player.resources[resource] += 2
            }
            else {
              player.resources[resource]++
            }
          }
        }
      }
    }
  }

  moveRobber() {
    this.robbing = true
  }
}

module.exports = Satan