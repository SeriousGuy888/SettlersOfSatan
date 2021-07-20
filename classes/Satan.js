const Hex = require("./Hex.js")
const Vertex = require("./Vertex.js")
const Edge = require("./Edge.js")
const Graph = require("./Graph.js")
const lobbies = require("../server/lobbies.js")
const users = require("../server/users.js")
const { Socket } = require("socket.io")

/*
  0 = no hex
  1 = regular hex
  2 = fake hex with only south vertex
  3 = fake hex with only north vertex
*/
const boardLayout = [
  [0,0,2,2,2,2,0,0],
  [0,2,1,1,1,2,0,0],
  [0,2,1,1,1,1,2,0],
  [0,1,1,1,1,1,0,0],
  [0,3,1,1,1,1,3,0],
  [0,3,1,1,1,3,0,0],
  [0,0,3,3,3,3,0,0],
]
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
    
    this.board = []
    this.vertexes = []
    this.edges = []
    this.graph = new Graph()

    this.turn = null // stores the player id of the currently playing playeur
    this.turnCycle = 0 // how many times every player has been given a turn
    this.turnStage = 0 // turn stage manages whether the dice have been rolled
    this.turnCountdownTo = null // a timestamp that when passed, the present turn will be forcefully passed
    this.setupTurnPlaced = { // stores the coordinates of the pieces placed this setup turn
      settlement: null,
      road: null,
    }

    this.robbing = false
  }

  tick() {
    const lobby = lobbies.getLobby(this.lobbyId)
    
    if(
      !this.turn || // no turn is set
      this.getPlayer(this.turn).disconnected || // player whose turn it is has disconnected
      this.turnCountdownTo - Date.now() < 0 // time limit for the turn has passed
    ) {
      this.nextTurn()
    }

    let playersPublicData = {}
    for(let i in this.players) {
      playersPublicData[i] = this.players[i].getPublicData()
    }
    
    const tickData = {
      board: this.board,
      vertexes: this.vertexes,
      edges: this.edges,
      players: playersPublicData,
      turn: this.turn,
      turnCycle: this.turnCycle,
      turnStage: this.turnStage,
      turnCountdownTo: this.turnCountdownTo,
      robbing: this.robbing,
    }

    if(JSON.stringify(tickData) !== this.prevTickData) {
      lobby.broadcast("game_update", tickData)
      this.prevTickData = JSON.stringify(tickData)
    }
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

  getVertex(coords) {
    if(coords == undefined || coords.x == undefined || coords.y == undefined || coords.v == undefined) return null
    return this.vertexes.filter(e => e.coords.x === coords.x && e.coords.y === coords.y && e.coords.v === coords.v)[0]
  }

  getEdge(coordsArr) { // i dont know how efficient this is but it does work without requiring the coords to be in a specific order
    return this.edges.filter(e => {
      const coordsArrStringified = coordsArr.map(f => JSON.stringify(f))
      const elemCoordsArrStringified = e.coordsArr.map(f => JSON.stringify(f))
      return elemCoordsArrStringified.every(f => coordsArrStringified.includes(f))
    })[0]
  }

  getBoard() {
    return this.board
  }

  setUpBoard(players){
    this.board = []
    this.vertexes = []
    this.edges = []
    this.graph = new Graph()

    let hexTypeCounts = {
      mud: 3,
      forest: 4,
      mountain: 3,
      farm: 4,
      pasture: 4,
      desert: 1
    }

    let numberCounts = {}

    for (let i = 2; i < 13; i++){
      if (i !== 7){
        if (![2,12].includes(i)) numberCounts[i] = 2
        else numberCounts[i] = 1
      }
    }

    // console.log(numberCounts)

    if ([5,6].includes(players)) {
      for (let key in hexTypeCounts) { 
        hexTypeCounts[key] += 2
        if (key == "desert") hexTypeCounts[key] -= 2
      }
    }

    for (let y in boardLayout) {
      const row = boardLayout[y]

      this.board.push([])
      for(let x in row) {
        const space = row[x]

        // at this point the variable space should be a number where...
        // 0 = no hex here
        // 1 = regular hex with both vertexes
        // 2 = invisible hex with only a south vertex
        // 3 = invisible hex with only a north vertex

        if(space === 0)  {
          this.board[this.board.length - 1].push(null)
          continue
        }


        let hex = new Hex({
          x: parseInt(x),
          y: parseInt(y)
        })

        const addVertex = (v) => {
          const vertex = new Vertex({
            ...hex.coords,
            v,
          })
          
          const vertCoords = JSON.stringify(vertex.coords)
          
          this.vertexes.push(vertex)
          this.graph.addVertex(vertCoords)

          const adjacentVertexes = vertex.getAdjacentVertexes()
          for(let adjCoordsObj of adjacentVertexes) {
            this.graph.addEdge(vertCoords, JSON.stringify(adjCoordsObj))
          }
        }
        switch(space) {
          case 1:
            hex.resource = Object.keys(hexTypeCounts)[Math.floor(Math.random() * Object.keys(hexTypeCounts).length)]
            hexTypeCounts[hex.resource]--

            if(!hexTypeCounts[hex.resource]) delete hexTypeCounts[hex.resource]
  
            if(hex.resource === "desert") {
              hex.robber = true
            }
            else {
              hex.number = parseInt(Object.keys(numberCounts)[Math.floor(Math.random() * Object.keys(numberCounts).length)])
              numberCounts[hex.number]--
              if(!numberCounts[hex.number]) delete numberCounts[hex.number]
            }

            addVertex("north")
            addVertex("south")
            break
          case 2:
            hex.setInvisible(true)
            hex.setHarbour(true)
            addVertex("south")
            break
          case 3:
            hex.setInvisible(true)
            hex.setHarbour(true)
            addVertex("north")
            break
        }

        this.board[this.board.length - 1].push(hex)
      }
    }
    // this.graph.printMatrix() // prints quite a bit of false in the console

    // console.log(this.board)

    for(let row of this.board){
      // console.log(row)
      for(let hex of row){
        if(hex && (hex.number == 8 || hex.number == 6)){

          let needToMoveHex = false

          for(let adjacentHex of hex.getAdjacentHexes()) {
            if(this.board[adjacentHex.y][adjacentHex.x] && [8, 6].includes(this.board[adjacentHex.y][adjacentHex.x].number)) {
                needToMoveHex = true
                break
            }
          }
          
          while(needToMoveHex){
            let randomRowIndex = Math.floor(Math.random() * this.board.length)
            let randomHexIndex = Math.floor(Math.random() * this.board[randomRowIndex].length)
            let randomHex = this.board[randomRowIndex][randomHexIndex]

            let moveHex = true

            if(randomHex && randomHex.number){
              for(let adjacentHex of randomHex.getAdjacentHexes()) {
                if(this.board[adjacentHex.y][adjacentHex.x] && [8, 6].includes(this.board[adjacentHex.y][adjacentHex.x].number)) {
                  moveHex = null
                }
              }
              if(moveHex){
                let randomHexNumber = this.board[randomRowIndex][randomHexIndex].number

                this.board[randomRowIndex][randomHexIndex].number = hex.number
                hex.number = randomHexNumber
                needToMoveHex = false
              }
            }
          }
        }
      }
    }

    const { matrix } = this.graph
    for(let i in matrix) {
      for(let j in matrix[i]) {
        if(matrix[i][j]) { // if a connection exists between the nodes i and j,
          matrix[j][i] = false // my dumb way of nuking duplicates
          this.edges.push(new Edge([i, j].map(e => JSON.parse(e))))
        }
      }
    }
  }

  moveNumbers(){

  }

  processAction(playerId, actionData) {
    const action = actionData.action
    if(!action) return

    const coords = actionData.coords
    const coordsArr = actionData.coordsArr
    const vertex = this.getVertex(coords)
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

    const buildingCosts = {
      road: {
        bricks: 1,
        lumber: 1,
      },
      settlement: {
        bricks: 1,
        lumber: 1,
        wheat: 1,
        wool: 1,
      },
      city: {
        wheat: 2,
        ore: 3,
      },
    }
    const canAfford = (p, item) => {
      const playerResources = p.resources
      const cost = buildingCosts[item]
      if(!playerResources || !cost) return false

      return Object.keys(cost).every(resource => playerResources[resource] >= cost[resource])
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
          if(!canAfford(player, "settlement")) {
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

          vertex.setBuilding("settlement", playerId)
          if(this.inSetupTurnCycle()) this.setupTurnPlaced.settlement = vertex.coords
          else                        spendResourcesOn(player, "settlement")

          player.inventory.addSettlement(-1)
          this.refreshAllowedPlacements()
        }
        break
      case "place_city":
        if(!vertex) break
        if(!canAfford(player, "city")) {
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

          player.inventory.addCity(-1)
          player.inventory.addSettlement()
          this.refreshAllowedPlacements()
        }
        break
      case "place_road":
        const edge = this.getEdge(coordsArr)
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
          if(!canAfford(player, "road")) {
            printChatErr("You cannot afford this.")
            break
          }
        }

        if(player.inventory.getRoads() <= 0) {
          printChatErr("You are out of roads to place.")
          break
        }

        const vertexesConnectedToEdge = coordsArr.map(e => this.getVertex(e))
        const connectedToOwnedVertex = vertexesConnectedToEdge.some(vert => vert.building && vert.building.playerId === playerId)
        let connectedToOwnedEdge = false

        for(const vert of vertexesConnectedToEdge) {
          const adjacentVertexes = vert.getAdjacentVertexes().map(v => this.getVertex(v))
          const adjacentEdges = adjacentVertexes.map(vert2 => {
            if(!vert || !vert2) return
            return this.getEdge([vert.coords, vert2.coords])
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
      default:
        return
    }
  }

  refreshAllowedPlacements() {
    this.vertexes.forEach(vertex => {
      vertex.allowPlacement = true

      const adjEdges = []
      for(let adjVertCoords of vertex.getAdjacentVertexes()) {
        const adjVert = this.getVertex(adjVertCoords)
        if(!adjVert) continue
        if(adjVert.getBuilding()) vertex.allowPlacement = false // distance rule
        adjEdges.push(this.getEdge([vertex.coords, adjVertCoords]))
      }

      if(!this.inSetupTurnCycle() && adjEdges.every(loopEdge => loopEdge.road !== this.turn)) {
        vertex.allowPlacement = false
      }
    })
    this.edges.forEach(edge => {
      edge.allowPlacement = true // couldnt make it work so im just leaving this here -billzo
    })
  }

  nextTurn() {
    const playerIds = Object.keys(this.players)
    const sortedPlayerIds = playerIds.sort((a, b) => this.players[a].joinTimestamp - this.players[b].joinTimestamp)
    const firstJoiner = sortedPlayerIds[0]

    const currentIndex = sortedPlayerIds.indexOf(this.turn)
    if(currentIndex === -1 || !playerIds[currentIndex + 1]) { // there is no turn right now or the current turn is the last player
      this.turn = firstJoiner
      this.turnCycle++
    }
    else {
      this.turn = playerIds[currentIndex + 1]
    }

    if(this.players[this.turn].disconnected) {
      this.nextTurn()
    }
    else {
      this.turnStage = 0
      this.turnCountdownTo = new Date().setTime(new Date().getTime() + 60 * 1000)

      if(this.inSetupTurnCycle()) {
        this.setupTurnPlaced.settlement = null
        this.setupTurnPlaced.road = null
        this.turnStage = 1
      }

      this.refreshAllowedPlacements()

      lobbies.getLobby(this.lobbyId).printToChat([{
        text: `It is now ${this.players[this.turn].name}'s turn.`,
        style: {
          colour: "green",
        },
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
      for(const vertex of this.vertexes) {
        const building = vertex.getBuilding()
        if(!building) continue

        const adjacentHexes = vertex.getAdjacentHexes()
        const player = this.getPlayer(building.playerId)
        for(const hexCoords of adjacentHexes) {
          const hex = this.board[hexCoords.y][hexCoords.x]

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