class Vertex {
  constructor(coords) {
    this.coords = coords
    this.intersectingHexes = this.getIntersectingHexes()
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
}

module.exports = Vertex