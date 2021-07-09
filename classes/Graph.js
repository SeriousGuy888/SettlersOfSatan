// stolen from https://www.geeksforgeeks.org/implementation-graph-javascript/

class Graph {
  constructor() {
    this.vertexes = new Map()
  }

  addVertex(vertexId) {
    if(this.vertexes.has(vertexId)) return
    this.vertexes.set(vertexId, [])
  }

  addEdge(vertexA, vertexB) {
    if(!this.vertexes.has(vertexA)) this.addVertex(vertexA)
    if(!this.vertexes.has(vertexB)) this.addVertex(vertexB)

    this.vertexes.get(vertexA).push(vertexB)
    this.vertexes.get(vertexB).push(vertexA)
  }

  printGraph() {
    let getKeys = this.vertexes.keys()
  
    for(let i of getKeys) {
      let getValues = this.vertexes.get(i)
      let conc = ""

      for(let j of getValues) conc += j + " "

      console.log(i + " -> " + conc)
    }
  }
}

module.exports = Graph