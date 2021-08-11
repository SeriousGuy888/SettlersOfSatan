const Board = require("./Board.js")
const lobbies = require("../server/lobbies.js")
const constants = require("../server/constants.js")
const processGameAction = require("../server/functions/processGameAction.js")
const { buildingCosts, hexTypesResources } = constants

class Satan {
  constructor(lobbyId) {
    this.lobbyId = lobbyId
    this.players = {}
    
    this.board = new Board()

    this.gameEnd = false

    this.turn = null // stores the player id of the currently playing playeur
    this.turnCycle = 0 // how many times every player has been given a turn
    this.diceRolled = false // whether the dice have been rolled
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
    this.developmentCardUsed = false

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
      diceRolled: this.diceRolled,
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
    processGameAction(this, playerId, actionData)
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

          if(!buildingOwner.deals.map(d => JSON.stringify(d)).includes(JSON.stringify(harbour.deal))) {
            buildingOwner.deals.push(harbour.deal)
          }
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
    this.developmentCardUsed = false

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
      this.diceRolled = false
      this.turnTick = true
      this.turnCountdownTo = new Date().setTime(new Date().getTime() + 120 * 1000)

      this.clearTrade()
      this.clearRobbable()

      if(this.inSetupTurnCycle()) {
        this.setupTurnPlaced.settlement = null
        this.setupTurnPlaced.road = null
        this.diceRolled = true
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
        const handoutVals = Object.values(resourceHandouts[resource])
        if(!handoutVals.length) continue // skip resources that have 0 handout

        if(handoutVals.length === 1) { // special case for when there is only one player, where they still get the cards remaining
          const playerId = Object.keys(resourceHandouts[resource])
          const handoutAmount = Math.min(resourceHandouts[resource][playerId], this.stockpile[resource])


          if(handoutAmount < resourceHandouts[resource][playerId]) {
            this.getLobby().printToChat([{
              text: `The stockpile ran out of ${resource.toUpperCase()} so the one player who got it only got ${handoutAmount} instead of ${resourceHandouts[resource][playerId]}.`,
              style: { colour: "brown" }
            }])
          }

          this.giveResources(playerId, resource, handoutAmount)
        } else {
          // total amount of this resource being handed out
          const totalHandout = handoutVals.reduce((acc, cur) => acc + cur)

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
}

module.exports = Satan