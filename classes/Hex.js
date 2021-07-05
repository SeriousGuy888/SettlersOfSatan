class Hex {
  constructor(coords) {
    this.coords = coords

    this.number = null
    this.resource = null

    this.vertexes = {
      north: true,
      south: true
    }
  }
}

module.exports = Hex