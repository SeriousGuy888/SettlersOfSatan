class Inventory {
  constructor(settlements, cities, roads) {
    this.settlements = settlements
    this.cities = cities
    this.roads = roads
    this.developmentCards = []
  }

  getSettlements() { return this.settlements }
  getCities() { return this.cities }
  getRoads() { return this.roads }
  getDevelopmentCards() { return this.developmentCards }

  setSettlements(count) { this.settlements = count }
  setCities(count) { this.cities = count }
  setRoads(count) { this.roads = count }
  removeDevelopmentCard(card) { this.developmentCards.splice(this.developmentCards.indexOf(card), 1)}

  addSettlement(amt = 1) { this.settlements += amt }
  addCity(amt = 1) { this.cities += amt }
  addRoad(amt = 1) { this.roads += amt }
  addDevelopmentCard(card) { this.developmentCards.push(card) }
}

module.exports = Inventory