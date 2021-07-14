class Hex {
  constructor(coords) {
    this.coords = coords
    this.number = null
    this.robber = false
    this.resource = null

    this.invisible = false
    this.harbour = false
  }

  setInvisible(invisible) {
    this.invisible = invisible
  }

  setHarbour(harbour) {
    this.harbour = harbour
  }
}

module.exports = Hex