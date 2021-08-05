class Board {
  constructor() {
    this.hexMatrix = []
    this.robberCoords = null
  }

  addRow() {
    this.hexMatrix.push([])
  }
  getRow(index) {
    if(index >= 0) {
      return this.hexMatrix[index]
    }
    else {
      return this.hexMatrix[this.hexMatrix.length + index] // count from end if index is negative
    }
  }
  getHex(x, y) {
    return this.hexMatrix[y]?.[x]
  }

  getRobberHex() {
    if(!this.robberCoords) return null
    return this.getHex(...this.robberCoords)
  }
  setRobber(x, y) { this.robberCoords = [x, y] }

  getHeight() { return this.hexMatrix.length }
}

module.exports = Board