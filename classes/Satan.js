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

    this.gameEnd = false

    this.turn = null // stores the player id of the currently playing playeur
    this.turnCycle = 0 // how many times every player has been given a turn
    this.turnStage = 0 // turn stage manages whether the dice have been rolled
    this.turnTick = false // set to true when the turn has changed and set to false after the next tick (notifies clients of turn changes)
    this.turnCountdownTo = null // a timestamp that when passed, the present turn will be forcefully passed
    this.setupTurnPlaced = { // stores the coordinates of the pieces placed this setup turn
      settlement: null,
      road: null,
    }

    this.stockpile = {
      bricks: 20,
      lumber: 20,
      wool: 20,
      wheat: 20,
      ore: 20,
    }
    this.trade = {
      offer: null,
      takers: [],
      idempotency: null
    }

    this.robbing = false
    this.roadBuilding = 0

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
    const lobby = this.getLobby()
    
    if(!this.turn || this.getPlayer(this.turn).disconnected) { // no turn is set or current player has disconnected
      this.nextTurn()
      this.refreshAllowedPlacements()
    }
    if(this.turnCountdownTo - Date.now() < 0) { // time limit for the turn has passed
      this.getLobby().printToChat([{
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
      stockpile: this.stockpile,
      trade: this.trade,
      robbing: this.robbing,
      developmentCardDeck: this.developmentCardDeck,
      roadBuilding: this.roadBuilding,
    }

    let shouldTick = JSON.stringify(tickData) !== this.prevTickData
    if(shouldTick) {
      lobby.broadcast("game_update", tickData)
      this.prevTickData = JSON.stringify(tickData)
    }
    if(this.turnTick) this.turnTick = false

    for(const i in this.players) {
      this.players[i].tick(shouldTick) // tick all players individually to update them on their private data
    }
  }

  getLobby() {
    return lobbies.getLobby(this.lobbyId)
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

  printChatErr(msg, playerId){
    this.getLobby().printToUserChat(this.getPlayer(playerId).userId, [{
      text: msg,
      style: {
        colour: "red",
        italic: true,
      }
    }])
  }

  handleWin() {
    if(!this.turn) return
    if(this.gameEnd) return

    const lobby = this.getLobby()
    const currentPlayer = this.getPlayer(this.turn)
    if(currentPlayer.points < 10) return

    const leaderboard = Object.keys(this.players).sort((a, b) => this.players[b].points - this.players[a].points)

    lobby.printToChat([
      {
        text: `🎉 Game over!`,
        style: { colour: "magenta", bold: true }
      },
      {
        text: `1st Place: ${leaderboard.map(pid => this.players[pid].name).join(", followed by ")}`,
        style: { colour: "magenta" }
      },
      {
        text: "billzo still has not written any win handling code though",
        style: { colour: "violet" }
      }
    ])

    this.gameEnd = true
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
    
    const spendResourcesOn = (p, item) => {
      const playerResources = p.resources
      const cost = buildingCosts[item]
      if(!playerResources || !cost) return false

      Object.keys(cost).forEach(resource => playerResources[resource] -= cost[resource])
    }

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

    if(action.startsWith("place_")) {
      if(player.id !== this.turn) {
        this.printChatErr("It is not your turn.", playerId)
        return
      }
      if(this.turnStage === 0) {
        this.printChatErr("You need to roll the dice before doing this.", playerId)
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
            this.printChatErr("This is a setup turn. You must place a settlement before ending your turn.", playerId)
            break
          }
          if(!this.setupTurnPlaced.road) {
            this.printChatErr("This is a setup turn. You must place a road before ending your turn.", playerId)
            break
          }
        }
        if(this.robbing) {
          this.printChatErr("You must move the robber first.", playerId)
          break
        }
        if(Object.values(this.players).some(p => p.canBeRobbed)) {
          this.printChatErr("You must choose a player to rob in the playerlist first.", playerId)
          break
        }

        this.nextTurn()
        break
      case "place_settlement":
        if(!vertex) break
        if(this.inSetupTurnCycle()) {
          if(this.setupTurnPlaced.settlement) {
            this.printChatErr("This is a setup turn. You have already placed a settlement this turn.", playerId)
            break
          }
        }
        else {
          if(!player.canAfford(buildingCosts.settlement)) {
            this.printChatErr("You cannot afford this.", playerId)
            break
          }
        }

        if(player.inventory.getSettlements() <= 0) {
          this.printChatErr("You are out of settlements to place. You will need to upgrade some settlements to cities to get some settlements back.", playerId)
          break
        }

        if(vertex.getBuilding()?.type !== "settlement") {
          if(!vertex.allowPlacement) {
            this.printChatErr("A settlement must be placed connected to one of your roads and at least two edges from any other settlement.", playerId)
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
                  this.giveResources(player.id, resource, 1)
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
          this.printChatErr("You cannot afford this.", playerId)
          break
        }
        if(player.inventory.getCities() <= 0) {
          this.printChatErr("You are out of cities to place.", playerId)
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
        const edge = this.board.getEdge(coordsArr)
        if(!edge) break

        if(this.inSetupTurnCycle()) {
          if(this.setupTurnPlaced.road) {
            this.printChatErr("This is a setup turn. You have already placed a road this turn.", playerId)
            break
          }
          if(!this.setupTurnPlaced.settlement) {
            this.printChatErr("This is a setup turn. You must place a settlement first.", playerId)
            break
          }
          if(!coordsArr.map(e => JSON.stringify(e)).includes(JSON.stringify(this.setupTurnPlaced.settlement))) {
            this.printChatErr("This is a setup turn. Your road must be connected to the settlement you placed this turn.", playerId)
            break
          }
        }
        else {
          if(!player.canAfford(buildingCosts.road) && !this.roadBuilding) {
            this.printChatErr("You cannot afford this.", playerId)
            break
          }
        }

        if(player.inventory.getRoads() <= 0) {
          this.printChatErr("You are out of roads to place.", playerId)
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
          this.printChatErr("You can only place a road where it is connected to a settlement, city, or road that you own.", playerId)
          break
        }
        
        if(!edge.getRoad()) {
          edge.setRoad(playerId)
          if(this.inSetupTurnCycle()) this.setupTurnPlaced.road = edge.coordsArr
          else if(!this.roadBuilding) spendResourcesOn(player, "road")
          player.inventory.addRoad(-1)
          if(this.roadBuilding) this.roadBuilding--
        }

        break
      case "move_robber":
        if(player.id !== this.turn) {
          this.printChatErr("It is not your turn.", playerId)
          break
        }
        if(this.turnStage !== 1) {
          this.printChatErr("The dice have not been rolled this turn.", playerId)
          break
        }
        if(!this.robbing) {
          this.printChatErr("The robber cannot be moved this turn or has already been moved.", playerId)
          break
        }

        const newRobberHex = this.board.getHex(coords.x, coords.y)

        if(!newRobberHex || newRobberHex.invisible) {
          this.printChatErr("Invalid coordinates provided.", playerId)
          break
        }
        if(newRobberHex.robber) {
          this.printChatErr("The robber must be moved to a different hex.", playerId)
          break
        }
        this.board.moveRobber(coords.x, coords.y)
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
          this.printChatErr("It is not your turn.", playerId)
          break
        }
        if(this.turnStage !== 1) {
          this.printChatErr("The dice have not been rolled this turn.", playerId)
          break
        }

        const robFromId = actionData.robFrom
        const robFrom = this.getPlayer(robFromId)
        if(!robFrom || !robFrom.canBeRobbed) {
          this.printChatErr("Invalid player.", playerId)
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
        this.clearRobbable()

        this.getLobby().printToChat([{ // temp
          text: `${player.name} stole 1 ${stealResource} from ${robFrom.name}`
        }])
        break
      case "buy_development_card":

        // if(!player.canAfford(buildingCosts.developmentCard)) {
        //   this.printChatErr("You cannot afford this.")
        //   break
        // }

        let card = this.developmentCardDeck[Math.floor(Math.random() * this.developmentCardDeck.length)]
        player.inventory.addDevelopmentCard(new DevelopmentCard(card, this.lobbyId, player.id, this.getLobby().game.turnCycle))
        this.developmentCardDeck.splice(this.developmentCardDeck.indexOf(card), 1)

        // spendResourcesOn(player, "developmentCard")
        break

      case "use_development_card":

        console.log(actionData)
        console.log(player.inventory.developmentCards)
        console.log()
        player.inventory.developmentCards[player.inventory.developmentCards.map(function(e){return e.id}).indexOf(actionData.card.id)].use()
        break
      case "harbour_trade":
        if(player.id !== this.turn) {
          this.printChatErr("It is not your turn.", playerId)
          break
        }
        if(this.inSetupTurnCycle()) {
          this.printChatErr("Trading is not allowed during setup turns.", playerId)
          break
        }
        if(this.turnStage !== 1) {
          this.printChatErr("The dice have not been rolled this turn.", playerId)
          break
        }
        if(!player.canAfford(sanitisedOffer.offerer)) {
          this.printChatErr("You do not have the resources necessary for this trade.", playerId)
          break
        }

        break
      case "offer_trade":
        if(player.id !== this.turn) {
          this.printChatErr("It is not your turn.", playerId)
          break
        }
        if(this.inSetupTurnCycle()) {
          this.printChatErr("Trading is not allowed during setup turns.", playerId)
          break
        }
        if(this.turnStage !== 1) {
          this.printChatErr("The dice have not been rolled this turn.", playerId)
          break
        }
        if(!player.canAfford(sanitisedOffer.offerer)) {
          this.printChatErr("You do not have the resources necessary for this trade.", playerId)
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
          this.printChatErr("This trade offer does not exist or has expired.", playerId)
          break
        }
        if(playerId === this.turn) {
          this.printChatErr("You cannot accept your own trade.", playerId)
          break
        }
        if(this.trade.takers.includes(playerId)) {
          this.printChatErr("You've already accepted this trade. Please wait for the offerer to decide.", playerId)
          break
        }
        if(!this.getPlayer(playerId).canAfford(this.trade.offer.taker)){
          this.printChatErr("You cannot afford this trade.", playerId)
          break
        }
        
        if(this.turnStage !== 1) break

        this.trade.takers.push(playerId)
        lobby.printToUserChat(player.userId, [{text: ":D"}])
        break
      case "confirm_trade":
        if(player.id !== this.turn) {
          this.printChatErr("It is not your turn.", playerId)
          break
        }
        if(!this.trade.offer) {
          this.printChatErr("There is no trade to confirm.", playerId)
          break
        }

        const tradeTakerId = actionData.tradeWith
        if(!this.trade.takers.includes(tradeTakerId)) {
          this.printChatErr("This player has not accepted the trade offer.", playerId)
          break
        }

        const tradeTaker = this.getPlayer(tradeTakerId)
        if(!tradeTaker) break

        this.finishTrade(this.trade.offer, this.getPlayer(this.turn), tradeTaker)
        this.clearTrade()
        break
      case "cancel_trade":
        if(player.id !== this.turn) {
          this.printChatErr("It is not your turn.", playerId)
          break
        }
        if(!this.trade.offer) {
          this.printChatErr("There is no trade to cancel.", playerId)
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
    
    this.refreshAllowedPlacements()
  }

  finishTrade(deal, party1, party2) {
    const { offerer, taker } = deal

    const printNoRes = (human) => {
      this.getLobby().printToChat([{
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

  giveResources(playerId, resource, amount) {
    this.getPlayer(playerId).resources[resource] += amount
    this.stockpile[resource] -= amount
  }

  refreshAllowedPlacements() {
    if(!this.turn) return

    this.handleWin()
    
    Object.values(this.players).forEach(p => {
      p.deals = [{ resource: "any", amount: 4 }]
    })

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


      const buildingOwner = this.getPlayer(vertex.getBuilding()?.playerId)
      if(buildingOwner) {
        const harbourCoords = vertex.harbour
        if(harbourCoords) {
          const harbourHex = this.board.getHex(harbourCoords.x, harbourCoords.y)
          const harbour = harbourHex.harbour
          buildingOwner.deals.push(harbour.deal)
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
        if(buildingName === "city")       enable = this.board.vertexes.some(v => v.building?.type === "settlement" && v.building?.playerId === player.id)
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

      if(reversedCycleIsNext) this.getLobby().printToChat([{
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

      this.getLobby().printToChat([{
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

    this.getLobby().printToChat([{
      text: `${this.players[this.turn].name} rolled ${number}`,
      dice: [dice1, dice2],
      style: {
        colour: "purple",
      },
    }])

    if(number === 7) {
      this.robbing = true
    }
    else {
      this.robbing = false

      const resourceHandouts = {}

      for(const vertex of this.board.vertexes) {
        const building = vertex.getBuilding()
        if(!building) continue
        const adjacentHexes = vertex.getAdjacentHexes()
        if(!building.playerId) continue

        for(const hexCoords of adjacentHexes) {
          const hex = this.board.getRow(hexCoords.y)[hexCoords.x]
          if(hex.robber) {
            continue
          }

          const resource = hexTypesResources[hex.resource]
          if(resource && hex.number === number) {
            if(!resourceHandouts[resource]) resourceHandouts[resource] = {}
            if(!resourceHandouts[resource][building.playerId]) resourceHandouts[resource][building.playerId] = 0
            resourceHandouts[resource][building.playerId] += (building.type === "city" ? 2 : 1)
          }
        }
      }
      
      for(const resource in resourceHandouts) {
        // total amount of this resource being handed out
        const totalHandout = Object.values(resourceHandouts[resource]).reduce((acc, cur) => acc + cur)

        if(totalHandout > this.stockpile[resource]) {
          this.getLobby().printToChat([{
            text: `${resource.toUpperCase()} could not be handed out because there were not enough cards in the stockpile.`,
            style: { colour: "brown" }
          }])
          continue
        }

        for(const playerId in resourceHandouts[resource]) {
          this.giveResources(playerId, resource, resourceHandouts[resource][playerId])
        }
      }
    }
  }
}

module.exports = Satan