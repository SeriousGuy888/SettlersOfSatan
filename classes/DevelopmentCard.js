const lobbies = require("../server/lobbies.js")

class DevelopmentCard {
    constructor(type, lobbyId, playerId, cycleBought) {
      this.type = type
      this.victoryPoint = ["library", "market", "chapel", "great hall", "university"].includes(type)
      this.lobbyId = lobbyId
      this.playerId = playerId
      this.cycleBought = cycleBought
      
      if (this.type == "knight") this.knightType = Math.floor(Math.random() * 3) + 1
      else this.knightType = null
    }

    use() {
      if(lobbies.getLobby(this.lobbyId).game.turnCycle != this.cycleBought){
        lobbies.getLobby(this.lobbyId).game.players[this.playerId].inventory.removeDevelopmentCard(this)
        switch(this.type) {
          case "knight":
            break
        }
      }
    }
}

module.exports = DevelopmentCard