const Inventory = require("./Inventory.js")

class Player {
  constructor(id, data) {
    this.id = id

    const { name, colour, joinTimestamp, userId } = data
    this.name = name
    this.colour = colour
    this.joinTimestamp = joinTimestamp
    this.userId = userId

    this.disconnected = false
    this.points = 0
    this.inventory = new Inventory(5, 4, 15)
    this.resources = {
      bricks: 0,
      lumber: 0,
      wool: 0,
      wheat: 0,
      ore: 0,
    }
  }
  
  canAfford(cost) {
    const { resources } = this
    if(!cost) return false

    return Object
      .keys(cost) // get the names of all the resources in the cost
      .every(resource => { // test that every resource...
        return resources[resource] >= cost[resource] // this player has at least the amount of that resource
      })
  }

  getPublicData() {
    const { id, name, colour, inventory, points, resources } = this
    const resourceCardCount = Object.values(resources).reduce((acc, cur) => acc += cur)
    return { id, name, colour, inventory, points, resourceCardCount }
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