const e = require("express")
const Hex = require("./Hex.js")

const boardLayout = [
  [null, true, true, true, null],
  [true, true, true, true, null],
  [true, true, true, true, true],
  [true, true, true, true, null],
  [null, true, true, true, null],
]

class Satan {
  constructor() {
    this.board = []
    this.players = {}
  }

  tick() {
    console.log(`Ticking game!`)
  }

  getPlayers() {
    return this.players
  }

  setPlayer(playerId, data) {
    if(!data) delete this.players[playerId]
    else this.players[playerId] = data
  }

  getBoard() {
    return this.board
  }

  setUpBoard(players){
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
      if (![2,12].includes(i)) numberCounts[i] = 2
      else numberCounts[i] = 1
    }

    // console.log(numberCounts)

    if ([5,6].includes(players)) {
      for (let key in resourceCounts) { 
        resourceCounts[key] += 2
        if (key == "desert") resourceCounts[key] -= 2
      }
    }

    for (let row of boardLayout) {
      this.board.push([])
      for(let space of row){
        if (space) {
          let hex = new Hex()

          hex.resource = Object.keys(resourceCounts)[Math.floor(Math.random() * Object.keys(resourceCounts).length)]
          resourceCounts[hex.resource] -= 1
          if (!resourceCounts[hex.resource]) delete resourceCounts[hex.resource]

          // console.log(hex.resource)

          hex.number = Object.keys(numberCounts)[Math.floor(Math.random() * Object.keys(numberCounts).length)]
          numberCounts[hex.number] -= 1
          if (!numberCounts[hex.number]) delete numberCounts[hex.number]

          this.board[this.board.length - 1].push(hex)
        }
        else this.board[this.board.length - 1].push(null)
        // console.log(this.board[this.board.length - 1])
      }
    }
    // console.log(this.board)
  }

}

module.exports = Satan