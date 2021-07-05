const Vertex = require("./Vertex.js")

class Hex {
  constructor(coords) {
    this.coords = coords

    this.number = null
    this.resource = null

    this.vertexes = {
      north: new Vertex({
        ...coords,
        v: "north",
      }),
      south: new Vertex({
        ...coords,
        v: "south",
      })
    }
  }
}

module.exports = Hex