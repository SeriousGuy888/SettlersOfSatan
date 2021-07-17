const Hex = require("./Hex.js")
const Vertex = require("./Vertex.js")
const Edge = require("./Edge.js")
const Graph = require("./Graph.js")
const lobbies = require("../server/lobbies.js")
const users = require("../server/users.js")

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
    
    this.board = []
    this.vertexes = []
    this.edges = []
    this.graph = new Graph()
    
    this.players = {}

    this.turn = null // stores the player id of the currently playing playeur
    this.turnCycle = 0 // how many times every player has been given a turn
    this.turnStage = 0 // turn stage manages whether the dice have been rolled
  }

  tick() {
    const lobby = lobbies.getLobby(this.lobbyId)
    
    if(!this.turn) this.nextTurn()

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

  getEdge(coordsArr) {
    return this.edges.filter(e => {
      return ( // im not fixing this dumb code -billzo
        e.coordsArr[0].x === coordsArr[0].x && e.coordsArr[0].y === coordsArr[0].y && e.coordsArr[0].v === coordsArr[0].v &&
        e.coordsArr[1].x === coordsArr[1].x && e.coordsArr[1].y === coordsArr[1].y && e.coordsArr[1].v === coordsArr[1].v
      )
    })[0]
  }

  getBoard() {
    return this.board
  }

  setUpBoard(players){
    this.board = []
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

          console.log("i bea a red hex")

          let needToMoveHex = false

          for(let adjacentHex of hex.getAdjacentHexes()) {
            console.log(adjacentHex)
            if(this.board[adjacentHex.y][adjacentHex.x] && [8, 6].includes(this.board[adjacentHex.y][adjacentHex.x].number)) {
                needToMoveHex = true
                break
            }
          }
          
          while(needToMoveHex){
            console.log("moving hex...")
            let randomRowIndex = Math.floor(Math.random() * this.board.length)
            let randomHexIndex = Math.floor(Math.random() * this.board[randomRowIndex].length)
            let randomHex = this.board[randomRowIndex][randomHexIndex]

            let moveHex = true

            if(randomHex && randomHex.number){
              for(let adjacentHex of randomHex.getAdjacentHexes()) {
                if(this.board[adjacentHex.y][adjacentHex.x] && [8, 6].includes(this.board[adjacentHex.y][adjacentHex.x].number)) {
                  moveHex = null
                  console.log("moveHex beas null")
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

    switch(action) {
      case "roll_dice":
        if(this.turnStage !== 0) break
        this.rollDice()
        this.turnStage++
        break
      case "end_turn":
        if(player.id !== this.turn) break
        this.nextTurn()
        break
      case "place_settlement":
        if(this.turnStage === 0) break
        if(!vertex) break

        if(player.inventory.getSettlements() <= 0) break
        if(vertex.getBuilding()?.type !== "settlement") {
          let adjVerts = []

          for(let adjVertCoords of vertex.getAdjacentVertexes()) {
            const adjVert = this.getVertex(adjVertCoords)
            if(!adjVert) continue

            // Distance Rule: a settlement may only be placed where all adjacent intersections are vacant
            if(adjVert.getBuilding()) break

            adjVerts.push(adjVert)
          }

          vertex.setBuilding("settlement", playerId)
          player.inventory.addSettlement(-1)
          adjVerts.forEach(vert => vert.noPlace = true)
        }
        break
      case "place_city":
        if(this.turnStage === 0) break
        if(!vertex) break
        if(player.inventory.getCities() <= 0) break
        
        const existingBuilding = vertex.getBuilding()
        if(!existingBuilding) break
        if(existingBuilding.type === "settlement" && existingBuilding.playerId === playerId) {
          vertex.setBuilding("city", playerId)
          player.inventory.addCity(-1)
        }
        break
      case "place_road":
        if(this.turnStage === 0) break
        
        const edge = this.getEdge(coordsArr)
        if(!edge) break
        
        if(player.inventory.getRoads() <= 0) break
        if(!edge.getRoad()) {
          edge.setRoad(playerId)
          player.inventory.addRoad(-1)
        }
        break
      default:
        return
    }
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

      lobbies.getLobby(this.lobbyId).printToChat([{
        text: `It is now ${this.players[this.turn].name}'s turn.`,
        style: {
          colour: "green",
        },
      }])
    }
  }

  rollDice() {
    let dice1 = Math.floor(Math.random() * 6) + 1
    let dice2 = Math.floor(Math.random() * 6) + 1
    let number = dice1 + dice2

    lobbies.getLobby(this.lobbyId).printToChat([{
      text: `${this.players[this.turn].name} rolled ${dice1}+${dice2} = ${number}`,
      style: {
        colour: "purple",
      },
    }])

    for(const vertex of this.vertexes) {
      const building = vertex.getBuilding()
      if(!building) continue

      const adjacentHexes = vertex.getAdjacentHexes()
      const player = this.getPlayer(building.playerId)
      for(const hexCoords of adjacentHexes) {
        const hex = this.board[hexCoords.y][hexCoords.x]
        const resource = hexTypesResources[hex.resource]

        if(resource && hex.number == number) player.resources[resource]++
      }
    }

  }

}

module.exports = Satan