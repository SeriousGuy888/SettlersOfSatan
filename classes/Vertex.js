class Vertex {
  constructor(coords) {
    this.coords = coords
    this.intersectingHexes = this.getIntersectingHexes()
    this.building = null
  }

  getIntersectingHexes() {
    const { coords } = this
    const managerHex = { x: coords.x, y: coords.y } // the coords of the hex that manages this vertex
    
    let intersectingHexes = [managerHex]
    if(coords.v === "north") {
      intersectingHexes.push({ x: coords.x,       y: coords.y - 1 })
      intersectingHexes.push({ x: coords.x + 1,   y: coords.y - 1 })
    }
    else {
      intersectingHexes.push({ x: coords.x - 1,   y: coords.y + 1 })
      intersectingHexes.push({ x: coords.x,       y: coords.y + 1 })
    }

    return intersectingHexes
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