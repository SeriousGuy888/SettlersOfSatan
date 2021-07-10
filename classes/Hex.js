class Hex {
  constructor(coords) {
    this.coords = coords
    this.number = null
    this.robber = false
    this.resource = null
    this.invisible = false
  }

  setInvisible(invisible) {
    this.invisible = invisible
  }
}

module.exports = Hex