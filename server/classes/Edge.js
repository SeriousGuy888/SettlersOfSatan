const Vertex = require("./Vertex.js")

class Edge {
  constructor(coordsArr) {
    this.coordsArr = coordsArr
    this.road = null
    this.allowPlacement = false // whether the player whose turn it is is allowed to place anything here
    this.traversed = false // used for finding longest road
  }

  getRoad() {
    return this.road || null
  }

  setRoad(playerId) { // an edge can have a playerid for a road or null for no road
    this.road = playerId
  }

  getAdjacentEdges() {
    const { coordsArr } = this
    const allAdjEdges = []
    for(let coords of coordsArr) {
      const adjCoords = new Vertex(coords)
        .getAdjacentVertexes()
        .filter(v => (
          !JSON.stringify(coordsArr).includes(JSON.stringify(v))
        ))
      
      allAdjEdges.push(...adjCoords.map(c => [c, coords]))
    }

    return allAdjEdges
  }
}

module.exports = Edge