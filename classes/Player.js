const Inventory = require("./Inventory.js")

class Player {
  constructor(colour) {
    this.colour = colour
    this.inventory = new Inventory(5, 4, 15)
    this.cards = []
  }

  getColour() {
    return this.colour
  }
}

module.exports = Player