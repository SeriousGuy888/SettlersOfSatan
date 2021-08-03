class DevelopmentCard {
    constructor(type) {
      this.type = type
      this.victoryPoint = ["library", "market", "chapel", "great Hall", "university"].includes(type)

    }

    use() {
      
    }
}

module.exports = DevelopmentCard