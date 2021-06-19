class Inventory {
  constructor(settlements, cities, roads) {
    this.settlements = settlements
    this.cities = cities
    this.roads = roads
  }

  getSettlements() { return this.settlements }
  getCities() { return this.cities }
  getRoads() { return this.roads }

  setSettlements(count) { this.settlements = count }
  setCities(count) { this.cities = count }
  setRoads(count) { this.roads = count }

  addSettlement(amt) { this.settlements += amt }
  addCity(amt) { this.cities += amt }
  addRoad(amt) { this.roads += amt }
}

module.exports = Inventory