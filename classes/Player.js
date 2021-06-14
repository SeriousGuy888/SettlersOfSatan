class Player {
  constructor(colour) {
    this.colour = colour
    this.cards = []
  }

  getColour() {
    return this.colour
  }
}

module.exports = Player