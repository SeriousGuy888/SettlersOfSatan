const Hex = require("./Hex.js")
const Vertex = require("./Vertex.js")
const Graph = require("./Graph.js")

/*
  0 = no hex
  1 = regular hex
  2 = fake hex with only south vertex
  3 = fake hex with only north vertex
  4 = fake hex without vertexes (only manages harbours)
*/
const boardLayout = [
  [0,0,2,2,2,2,0,0],
  [0,2,1,1,1,2,0,0],
  [0,2,1,1,1,1,2,0],
  [4,1,1,1,1,1,4,0],
  [0,3,1,1,1,1,3,0],
  [0,3,1,1,1,3,0,0],
  [0,0,3,3,3,3,0,0],
]

class Board {
  constructor() {
    this.hexes = []
    this.vertexes = null
    this.edges = null
    this.graph = null

    this.robberCoords = null
  }

  setup(playerCount) {
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

    for (let i = 2; i <= 12; i++) {
      if(i !== 7) {
        if(![2,12].includes(i)) numberCounts[i] = 2
        else numberCounts[i] = 1
      }
    }

    if([5,6].includes(playerCount)) {
      for(let key in hexTypeCounts) { 
        hexTypeCounts[key] += 2
        if(key === "desert") hexTypeCounts[key] -= 2
      }
    }

    for(let y = 0; y < boardLayout.length; y++) {
      const templateRow = boardLayout[y]
      this.addRow()

      for(let x = 0; x < templateRow.length; x++) {
        const space = templateRow[x]

        if(space === 0)  {
          this.getRow(-1).push(null)
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
            addVertex("south")
            break
          case 3:
            hex.setInvisible(true)
            addVertex("north")
            break
          case 4:
            hex.setInvisible(true)
            break
        }

        this.getRow(-1).push(hex)
        if(hex.robber) this.setRobber(x, y)
      }
    }
  }

  addRow() {
    this.hexes.push([])
  }
  getRow(index) {
    if(index >= 0) {
      return this.hexes[index]
    }
    else {
      return this.hexes[this.hexes.length + index] // count from end if index is negative
    }
  }
  getHex(x, y) {
    return this.hexes[y]?.[x]
  }

  getRobberHex() {
    if(!this.robberCoords) return null
    return this.getHex(...this.robberCoords)
  }
  setRobber(x, y) { this.robberCoords = [x, y] }

  getHeight() { return this.hexes.length }
}

module.exports = Board