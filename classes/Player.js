const Inventory = require("./Inventory.js")

class Player {
  constructor(id, colour) {
    this.id = id
    this.colour = colour
    this.inventory = new Inventory(2, 0, 2)
    this.cards = []
  }

  getPublicData() {
    const { id, colour, inventory } = this
    return { id, colour, inventory }
  }

  getColour() {
    return this.colour
  }

  getInventory() {
    return this.inventory
  }
}

module.exports = Player