class DevelopmentCard {
    constructor(type) {
      this.type = type
      this.victoryPoint = ["Library", "Market", "Chapel", "Great Hall", "University"].includes(type)
    }
}