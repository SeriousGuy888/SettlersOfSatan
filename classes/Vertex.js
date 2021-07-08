class Vertex {
  constructor(coords) {
    this.coords = coords
    this.adjacentHexes = this.getAdjacentHexes()
    this.building = null
  }

  getAdjacentHexes() {
    const { coords } = this
    const managerHex = { x: coords.x, y: coords.y } // the coords of the hex that manages this vertex
    
    let adjacentHexes = [managerHex]
    if(coords.v === "north") {
      adjacentHexes.push({ x: coords.x,       y: coords.y - 1 })
      adjacentHexes.push({ x: coords.x + 1,   y: coords.y - 1 })
    }
    else {
      adjacentHexes.push({ x: coords.x - 1,   y: coords.y + 1 })
      adjacentHexes.push({ x: coords.x,       y: coords.y + 1 })
    }

    return adjacentHexes
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