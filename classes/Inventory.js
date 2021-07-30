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

  setSettlements(count) { this.settlements = count }
  setCities(count) { this.cities = count }
  setRoads(count) { this.roads = count }

  addSettlement(amt = 1) { this.settlements += amt }
  addCity(amt = 1) { this.cities += amt }
  addRoad(amt = 1) { this.roads += amt }
  addDevelopmentCard(amt = 1) { this.developmentCards.push("hi") }
}

module.exports = Inventory