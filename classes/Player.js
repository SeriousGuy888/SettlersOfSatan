const Inventory = require("./Inventory.js")
const users = require("../server/users.js")

class Player {
  constructor(id, data) {
    this.id = id

    const { name, colour, joinTimestamp, userId } = data
    this.name = name
    this.colour = colour
    this.joinTimestamp = joinTimestamp
    this.userId = userId

    this.disconnected = false
    this.canBeRobbed = false
    this.points = 0
    this.inventory = new Inventory(5, 4, 15)
    this.resources = {
      bricks: 0,
      lumber: 0,
      wool: 0,
      wheat: 0,
      ore: 0,
    }

    this.deals = []
    
    // controls the frontend game controls like the place settlement button and whether they are enabled
    // (they are disabled when the player cannot afford the cost)
    this.enableControls = {}
  }

  tick(force) {
    let tickData = {
      id: this.id,
      name: this.name,
      colour: this.colour,
      inventory: this.inventory,
      resources: this.resources,
      enableControls: this.enableControls,
      deals: this.deals,
    }

    if(!force && JSON.stringify(tickData) === JSON.stringify(this.prevTickData)) return

    const user = users.getUser(this.userId)
    const socket = user?.socket
    if(!socket) return
    socket.emit("player_update", tickData)
    this.prevTickData = tickData
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

  getResourceCardCount() {
    const { resources } = this
    return Object.values(resources).reduce((acc, cur) => acc += cur)
  }

  getPublicData() {
    const { id, name, colour, inventory, canBeRobbed, points } = this
    const resourceCardCount = this.getResourceCardCount()
    return { id, name, colour, inventory, canBeRobbed, points, resourceCardCount }
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