const Inventory = require("./Inventory.js")
const lobbies = require("../lobbies.js")
const users = require("../users.js")

class Player {
  constructor(id, lobbyId, data) {
    this.id = id
    this.lobbyId = lobbyId

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

    this.knightsPlayed = 0 // how many knight cards this player has used; used for calculating largest army
  }

  tick(force) {
    let tickData = {
      id: this.id,
      name: this.name,
      colour: this.colour,
      inventory: this.inventory,
      resources: this.resources,
      deals: this.deals,
      enableControls: this.enableControls,
      knightsPlayed: this.knightsPlayed,
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

  drawResourceCards(amount) { // choose a random card using an efficient weighted random function
    const weightedRandom = (items, weights) => {
      // https://stackoverflow.com/a/55671924
      // adds up the weights so the last elem will have the total weight, giving each elem an area on a "number line"
      // then picks a random number on the number line and finds the element at that point
      // faster than adding every single element to a massive array based on the weights

      for(let i = 0; i < weights.length; i++)
        weights[i] += weights[i - 1] || 0
      let rand = Math.random() * weights[weights.length - 1]
      return items[weights.findIndex(e => e > rand)]
    }

    let returnItems = {}
    let resourceInventoryCopy = { ...this.resources }
    for(let i = 0; i < amount; i++) {
      const resource = weightedRandom(Object.keys(resourceInventoryCopy), Object.values(resourceInventoryCopy))
      if(!resource) break
      if(!returnItems[resource]) returnItems[resource] = 0
      resourceInventoryCopy[resource]--
      returnItems[resource]++
    }

    return returnItems
  }

  forfeit() {
    const lobby = this.getLobby()
    const satan = this.getGame()
    const board = satan.board
    const { vertexes, edges } = board

    // clear any buildings and roads this player has
    vertexes
      .filter(v => v.building?.playerId === this.id)
      .forEach(vertex => vertex.setBuilding(null))
    edges
      .filter(e => e.road === this.id)
      .forEach(edge => edge.setRoad(null))
    
    // return all the resources this player has to the stockpile
    for(const resource in this.resources) {
      satan.giveResources(this.id, resource, -this.resources[resource])
    }

    satan.setPlayer(this.id, null) // delete player from satan
    lobby.printToChat([{
      text: `${this.name} has disconnected and forfeited the game because billzo doesnt want to write reconnection code right now`,
      style: { colour: "red" }
    }])
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
  
  getLobby() {
    return lobbies.getLobby(this.lobbyId)
  }

  getGame() {
    return this.getLobby().game
  }

  setDisconnected(disconnected) {
    this.disconnected = disconnected
  }
}

module.exports = Player