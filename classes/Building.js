class Building {
  constructor(ownerPlayerId, type) {
    this.ownerPlayerId = ownerPlayerId
    this.type = type
  }

  getOwnerPlayerId() {
    return this.ownerPlayerId
  }

  getType() {
    return this.type
  }

  setOwnerPlayerId(ownerPlayerId) {
    this.ownerPlayerId = ownerPlayerId
  }

  setType(type) {
    this.type = type
  }
}

module.exports = Building