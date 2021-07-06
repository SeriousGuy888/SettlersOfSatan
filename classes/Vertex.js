class Vertex {
  constructor(coords) {
    this.coords = coords
    this.intersectingHexes = this.getIntersectingHexes()
    this.building = null
  }

  getIntersectingHexes() {
    const { coords } = this
    const managerHex = [coords[1], coords[0]] // the coords of the hex that manages this vertex
    
    let intersectingHexes = [managerHex]
    if(coords[2] === "north") {
      intersectingHexes.push([coords[1],      coords[0] - 1])
      intersectingHexes.push([coords[1] + 1,  coords[0] - 1])
    }
    else {
      intersectingHexes.push([coords[1] - 1,  coords[0] + 1])
      intersectingHexes.push([coords[1],      coords[0] + 1])
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