const Inventory = require("./Inventory.js")

class Player {
  constructor(colour) {
    this.colour = colour
    this.inventory = new Inventory(2, 0, 2)
    this.cards = []
  }

  getColour() {
    return this.colour
  }

  getInventory() {
    return this.inventory
  }
}

module.exports = Player