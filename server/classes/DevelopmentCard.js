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
    const player = game.getPlayer(this.playerId)

    const printChatNotif = (text) => {
      lobby.printToChat([{
        text, style: { colour: "purple" },
      }])
    }
console.log(game.turn)
    if(game.turnCycle != this.cycleBought && game.turn == this.playerId){
      player.inventory.removeDevelopmentCard(this)
      lobby.playSound("buy_development_card")
      switch(this.type) {
        case "knight":
          game.robbing = true
          player.knightsPlayed++
          printChatNotif(`${player.name} played a ${this.type} card and is now moving the robber. This player has now played ${player.knightsPlayed} knight cards.`)

          const previousLargestArmy = game.specialCards.largestArmy
          if(previousLargestArmy !== player.id && player.knightsPlayed >= 3) {
            const previousOwner = game.getPlayer(previousLargestArmy)
            if(!previousOwner || (player.knightsPlayed > previousOwner.knightsPlayed && previousOwner.id !== player.id)) {
              if(previousOwner)
                previousOwner.points -= 2
              player.points += 2
              game.specialCards.largestArmy = player.id
              printChatNotif(`${player.name} now has the largest army special card, gaining 2 victory points.`)
            }
          }
          break
        case "library": case "market": case "chapel": case "great hall": case "university":
          player.points++
          printChatNotif(`${player.name} played a ${this.type} card and gained 1 victory point.`)
          break
        case "road building":
          game.roadBuilding = 2
          printChatNotif(`${player.name} played a ${this.type} card and is now placing two free roads.`)
          break
        case "year of plenty":
          game.yearOfPlenty = 2
          printChatNotif(`${player.name} played a ${this.type} card and is now taking two free resource cards.`)
          break
        case "monopoly":
          game.monopoly = true
          printChatNotif(`${player.name} played a ${this.type} card and is now choosing a resource to take all of.`)
          break
      }
    }
    else {
      game.printChatErr("You can't use a development card on the turn you bought it", this.playerId)
    }
  }
}

module.exports = DevelopmentCard