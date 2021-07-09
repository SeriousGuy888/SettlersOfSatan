const Hex = require("./Hex.js")
const lobbies = require("../server/lobbies.js")

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

class Satan {
  constructor(lobbyId) {
    this.lobbyId = lobbyId
    this.board = []
    
    this.players = {}
  }

  tick() {
    const lobby = lobbies.getLobby(this.lobbyId)

    const tickData = {
      board: this.board,
      players: this.players,
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

  getBoard() {
    return this.board
  }

  setUpBoard(players){
    this.board = []
    let resourceCounts = {
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
      for (let key in resourceCounts) { 
        resourceCounts[key] += 2
        if (key == "desert") resourceCounts[key] -= 2
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
        switch(space) {
          case 1:
            hex.resource = Object.keys(resourceCounts)[Math.floor(Math.random() * Object.keys(resourceCounts).length)]
            resourceCounts[hex.resource]--

            if(!resourceCounts[hex.resource]) delete resourceCounts[hex.resource]
  
            if(hex.resource === "desert") hex.number = "robber"
            else {
              hex.number = Object.keys(numberCounts)[Math.floor(Math.random() * Object.keys(numberCounts).length)]
              numberCounts[hex.number]--
              if(!numberCounts[hex.number]) delete numberCounts[hex.number]
            }

            hex.createVertex("north")
            hex.createVertex("south")
            break
          case 2:
            hex.setInvisible(true)
            hex.createVertex("south")
            break
          case 3:
            hex.setInvisible(true)
            hex.createVertex("north")
            break
        }

        this.board[this.board.length - 1].push(hex)
      }
    }
    // console.log(this.board)
  }

  processAction(playerId, actionData) {
    const action = actionData.action
    if(!action) return

    const coords = actionData.coords
    const x = coords?.x
    const y = coords?.y
    const v = coords?.v

    switch(action) {
      case "place_settlement":
        if(x == undefined || y == undefined || v == undefined) break

        const hex = this.board[y][x]
        if(!hex) break
        const vertex = hex.vertexes[v]
        if(!vertex) break

        const player = this.getPlayer(playerId)

        if(player.inventory.getSettlements() > 0) {
          if(hex.vertexes[v].getBuilding()?.type !== "settlement") {
            hex.vertexes[v].setBuilding("settlement", playerId)
            player.inventory.addSettlement(-1)
          }
        }
        break
      default:
        return
    }
  }
}

module.exports = Satan