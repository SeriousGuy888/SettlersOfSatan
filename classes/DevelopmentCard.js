const lobbies = require("../server/lobbies.js")

class DevelopmentCard {
    constructor(type, lobbyId, playerId, cycleBought) {
      this.type = type
      this.victoryPoint = ["library", "market", "chapel", "great Hall", "university"].includes(type)
      this.lobbyId = lobbyId
      this.playerId = playerId
      this.cycleBought = cycleBought
    }

    use() {
      if(lobbies.getLobby(this.lobbyId.turnCycle != this.cycleBought)){
        lobbies.getLobby(lobbyId).game.players[playerId].inventory.removeDevelopmentCard(this)
        switch(this.type) {
          case "knight":
            break
        }
      }
    }
}

module.exports = DevelopmentCard