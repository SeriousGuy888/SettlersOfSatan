const Inventory = require("./Inventory.js")

class Player {
  constructor(id, colour, joinTimestamp) {
    this.id = id
    this.colour = colour
    this.joinTimestamp = joinTimestamp
    this.inventory = new Inventory(2, 0, 2)
    this.resources = {
      bricks: 0,
      lumber: 0,
      wool: 0,
      wheat: 0,
      ore: 0,
    }
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