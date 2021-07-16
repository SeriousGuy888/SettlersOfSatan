class Hex {
  constructor(coords) {
    this.coords = coords
    this.number = null
    this.robber = false
    this.resource = null

    this.invisible = false
    this.harbour = false
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
      {x: x + xOffset, y + 1},
      {x: x + xOffset, y - 1}
    )

    return adjacentHexes
  }

  setInvisible(invisible) {
    this.invisible = invisible
  }

  setHarbour(harbour) {
    this.harbour = harbour
  }
}

module.exports = Hex