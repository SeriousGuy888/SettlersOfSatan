const Vertex = require("./Vertex.js")

class Hex {
  constructor(coords) {
    this.coords = coords

    this.number = null
    this.resource = null

    this.vertexes = {
      north: new Vertex([...coords, "north"]),
      south: new Vertex([...coords, "south"])
    }
  }
}

module.exports = Hex