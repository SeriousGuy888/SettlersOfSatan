const Inventory = require("./Inventory.js")

class Player {
  constructor(id, name, colour, joinTimestamp) {
    this.id = id
    this.name = name
    this.colour = colour
    this.joinTimestamp = joinTimestamp
    this.disconnected = false
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
    const { id, name, colour, inventory, resources } = this
    return { id, name, colour, inventory, resources }
  }

  getColour() {
    return this.colour
  }

  getInventory() {
    return this.inventory
  }

  setDisconnected(disconnected) {
    this.disconnected = disconnected
  }
}

module.exports = Player