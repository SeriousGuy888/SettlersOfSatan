const lobbies = require("../server/lobbies.js")

class DevelopmentCard {
    constructor(type, lobbyId, playerId) {
      this.type = type
      this.victoryPoint = ["library", "market", "chapel", "great Hall", "university"].includes(type)
      this.lobbyId = lobbyId
      this.playerId = playerId

    }

    use() {
      lobbies.getLobby(lobbyId).game.players[playerId].removeDevelopmentCard(this)
    }
}

module.exports = DevelopmentCard