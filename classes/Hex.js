const Vertex = require("./Vertex.js")

class Hex {
  constructor(coords) {
    this.coords = coords
    this.number = null
    this.resource = null
    this.vertexes = {}
    this.invisible = false
  }

  setInvisible(invisible) {
    this.invisible = invisible
  }
  
  createVertex(vert) {
    this.vertexes[vert] = new Vertex({
      ...this.coords,
      v: vert,
    })
  }
}

module.exports = Hex