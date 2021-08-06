class Hex {
  constructor(coords) {
    this.coords = coords
    this.number = null
    this.robber = false
    this.resource = null

    this.invisible = false
    this.harbour = null
  }

  getAdjacentHexes() {
    const { coords } = this
    const { x, y } = coords
    
    const adjacentHexes = []
    adjacentHexes.push(
      { x: x - 1, y: y },
      { x: x + 1, y: y },
      { x: x, y: y + 1 },
      { x: x, y: y - 1 },
    )

    const xOffset = y % 2 === 0 ? -1 : 1
    adjacentHexes.push(
      { x: x + xOffset, y: y + 1 },
      { x: x + xOffset, y: y - 1 }
    )

    return adjacentHexes
  }

  getAdjacentVertexes() {
    const { coords } = this
    const { x, y } = coords
    
    const adjacentVertexes = []
    adjacentVertexes.push(
      { x, y,        v: "north" },
      { x, y,        v: "south" },
      { x, y: y - 1, v: "south" },
      { x, y: y + 1, v: "north" },
    )

    const xOffset = y % 2 === 0 ? -1 : 1
    adjacentVertexes.push(
      { x: x + xOffset, y: y - 1, v: "south" },
      { x: x + xOffset, y: y + 1, v: "north" }
    )

    return adjacentVertexes
  }

  setInvisible(invisible) {
    this.invisible = invisible
  }

  setHarbour(harbour) {
    this.harbour = harbour
  }
}

module.exports = Hex