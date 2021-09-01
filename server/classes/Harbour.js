class Harbour {
  constructor(vertexes) {
    this.vertexes = vertexes
    this.deal = {
      resource: null,
      amount: null
    }
  }

  setDeal(resource, amount) {
    this.deal = {
      resource,
      amount
    }
  }
}

module.exports = Harbour