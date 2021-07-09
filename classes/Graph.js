// stolen from https://reginafurness.medium.com/representing-a-weighted-graph-with-an-adjacency-matrix-in-javascript-8a803bfbc36f

class Graph {
  constructor() {
    this.matrix = {}
  }

  addVertex(key) {
    this.matrix[key] = {}

    for(let i in this.matrix) {
      this.matrix[i][key] = false
      this.matrix[key][i] = false
    }
  }

  addEdge(vertexA, vertexB) {
    if(!this.matrix.vertexA) this.addVertex(vertexA)
    if(!this.matrix.vertexB) this.addVertex(vertexB)

    this.matrix[vertexA][vertexB] = true
    this.matrix[vertexB][vertexA] = true
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