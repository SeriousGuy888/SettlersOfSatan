class Vertex {
  constructor(coords) {
    this.coords = coords
    this.building = null
    this.allowPlacement = false // whether the player whose turn it is is allowed to place anything here
    this.adjacentHexes = this.getAdjacentHexes()
  }

  getAdjacentHexes() {
    const { coords } = this
    const { x, y } = coords

    const managerHex = { x: coords.x, y: coords.y } // the coords of the hex that manages this vertex
    
    let adjacentHexes = [managerHex]

    const xOffset = y % 2 === 0 ? -1 : 1
    const yOffset = coords.v === "north" ? -1 : 1

    adjacentHexes.push(
      { x: x,           y: y + yOffset },
      { x: x + xOffset, y: y + yOffset },
    )

    return adjacentHexes
  }

  getAdjacentVertexes() {
    const { coords } = this
    const { x, y } = coords

    let adjacentVertexes = []
    if(coords.v === "north") {
      adjacentVertexes.push(
        { x,                              y: y - 2, v: "south" },
        { x,                              y: y - 1, v: "south" },
        { x: x + (y % 2 === 0 ? -1 : 1),  y: y - 1, v: "south" },
      )
    }
    else {
      adjacentVertexes.push(
        { x: x,                           y: y + 2, v: "north" },
        { x: x,                           y: y + 1, v: "north" },
        { x: x + (y % 2 === 0 ? -1 : 1),  y: y + 1, v: "north" },
      )
    }

    return adjacentVertexes
  }

  getBuilding() {
    return this.building || null
  }

  setBuilding(type, playerId) {
    if(!this.building) this.building = {}
    
    if(type) { // if type is not null
      this.building.type = type // set building
      if(playerId) this.building.playerId = playerId // only change owner player if arg is defined
    }
    else {
      this.building = null
    }
  }
}

module.exports = Vertex