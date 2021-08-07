const lobbies = require("../server/lobbies.js")

class DevelopmentCard {
    constructor(type, lobbyId, playerId, cycleBought) {
      this.type = type
      this.victoryPoint = ["library", "market", "chapel", "great hall", "university"].includes(type)
      this.lobbyId = lobbyId
      this.playerId = playerId
      this.cycleBought = cycleBought
      this.id = Date.now() + Math.random()
      
      if (this.type == "knight") this.knightType = Math.floor(Math.random() * 3) + 1
      else this.knightType = null
    }

    use() {
      let currentGame = lobbies.getLobby(this.lobbyId).game
      let player = currentGame.players[this.playerId]
      console.log("using dCard")
      if(currentGame.turnCycle != this.cycleBought){
        player.inventory.removeDevelopmentCard(this)
        switch(this.type) {
          case "knight":
            currentGame.robbing = true
            break
          
          case "library": case "market": case "chapel": case "great hall": case "university":
            player.points++
            break

          case "road building":
            currentGame.roadBuilding = 2
            // currentGame.processAction(this.playerId, { action: "place_road" })
            break
        }
      }
      else {
        currentGame.printChatErr("You can't use a development card on the turn you bought it", this.playerId)
      }
    }
}

module.exports = DevelopmentCard