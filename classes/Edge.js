class Edge {
  constructor(coordsArr) {
    this.coordsArr = coordsArr
    this.road = null
  }

  getRoad() {
    return this.road || null
  }

  setRoad(playerId) { // an edge can have a playerid for a road or null for no road
    this.road = playerId
  }
}

module.exports = Edge