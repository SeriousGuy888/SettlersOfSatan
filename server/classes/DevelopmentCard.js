const lobbies = require("../lobbies.js")

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
    const lobby = lobbies.getLobby(this.lobbyId)
    const game = lobby.game
    const player = game.players[this.playerId]

    const printChatNotif = (text) => {
      lobby.printToChat([{
        text, style: { colour: "purple" },
      }])
    }

    if(game.turnCycle != this.cycleBought){
      player.inventory.removeDevelopmentCard(this)
      switch(this.type) {
        case "knight":
          game.robbing = true
          printChatNotif(`${player.name} played a ${this.type.toUpperCase()} card and is now moving the robber.`)
          break
        case "library": case "market": case "chapel": case "great hall": case "university":
          player.points++
          printChatNotif(`${player.name} played a ${this.type.toUpperCase()} card and gained 1 victory point.`)
          break
        case "road building":
          game.roadBuilding = 2
          printChatNotif(`${player.name} played a ${this.type.toUpperCase()} card and is now placing two free roads.`)
          break
        case "year of plenty":
          game.yearOfPlenty = 2
          printChatNotif(`${player.name} played a ${this.type.toUpperCase()} card and is now taking two free resource cards.`)
          break
      }
    }
    else {
      game.printChatErr("You can't use a development card on the turn you bought it", this.playerId)
    }
  }
}

module.exports = DevelopmentCard