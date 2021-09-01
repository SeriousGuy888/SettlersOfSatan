class Edge {
  constructor(coordsArr) {
    this.coordsArr = coordsArr
    this.road = null
    this.allowPlacement = false // whether the player whose turn it is is allowed to place anything here
  }

  getRoad() {
    return this.road || null
  }

  setRoad(playerId) { // an edge can have a playerid for a road or null for no road
    this.road = playerId
  }
}

module.exports = Edge