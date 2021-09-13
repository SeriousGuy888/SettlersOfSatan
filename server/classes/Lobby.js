const Satan = require("./Satan.js")
const Player = require("./Player.js")

const users = require("../users.js")
const lobbies = require("../lobbies.js")

const { colourChoices } = lobbies

class Lobby {
  constructor(name) {
    let lobbyCode = ""
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for(let i = 0; i < 6; i++) {
      lobbyCode += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    this.name = name
    this.maxPlayers = 6
    this.code = lobbyCode
    this.users = {}
    this.takenColours = new Set()
    this.inGame = false
    this.game = null
  }

  getPlayerCount(spectatorsOnly) {
    return Object.values(this.users)
      .filter(u => spectatorsOnly ? u.spectator : !u.spectator)
      .length
  }

  isFull() {
    return this.getPlayerCount() >= this.maxPlayers
  }

  hasUser(id, byPlayerId) {
    if(!byPlayerId) {
      return id in this.users
    }
    else {
      let hasPlayer = false
      for(let i in this.users) {
        if(this.users[i].playerId === id) {
          hasPlayer = true
          break
        }
      }

      return hasPlayer
    }
  }

  tick() {
    if(this.game) {
      this.game.tick()
    }
  }

  join(userId, spectator) {
    if(this.hasUser(userId)) return

    const user = users.getUser(userId)
    this.users[userId] = {
      name: user.name,
      joinTimestamp: Date.now(),
      playerId: `${Date.now()}${Math.round(Math.random() * 1000).toString().padStart(3, "0")}`,
      userId: user.id,
      spectator,
      votekicks: [], // array of the ids of users who have votekicked this user
    }

    if(!spectator) {
      this.printToChat([{
        text: `${user.getName()} joined the lobby`,
        style: { colour: "orange" }
      }])
      this.setUserColour(userId)
    }
    
    lobbyHelpers.emitLobbyUpdate(this)
    return { playerId: this.users[userId].playerId }
  }

  leave(userId) {
    if(this.hasUser(userId)) {
      let wasHost = this.users[userId].host

      this.takenColours.delete(this.users[userId].colour)

      this.printToChat([{
        text: `${users.getUser(userId).getName()} left the lobby`,
        style: { colour: "orange" }
      }])

      if(this.game) {
        const player = this.game.getPlayer(this.users[userId].playerId)
        if(player) player.forfeit()
      }

      delete this.users[userId]
      lobbyHelpers.emitLobbyUpdate(this)

      if(Object.keys(this.getUsers()).length === 0) { // if the lobby is now empty
        console.log(`Closed empty lobby ${this.code}`)
        this.close() // close the lobby
        return true
      }

      if(wasHost) { // if the user who left was the lobby host
        let earliestJoinerId
        for(let i in this.users) { // find the user in the lobby who joined earliest
          if(!earliestJoinerId || this.users[i].joinTimestamp < this.users[earliestJoinerId].joinTimestamp) {
            earliestJoinerId = i
          }
        }

        this.setHost(earliestJoinerId) // give host privileges to that human
      }

      return true
    }
    return false
  }

  close() {
    lobbies.setLobby(this.code, null)
  }

  kick(playerId, votekick) {
    const kickedUser = users.getUser(this.getUser(playerId, true).userId)
    if(!kickedUser) return
    
    this.leave(kickedUser.id)
    kickedUser.setLobby(null)
    kickedUser.notifyOfKick(votekick ? "You were votekicked from that lobby." : "You were kicked from the lobby by the host.")
    
    this.printToChat([{
      text: votekick ? `${kickedUser.name} was votekicked` : `${kickedUser.name} was kicked by the host`,
      style: { colour: "red" }
    }])
  }

  votekick(playerId, voterPlayerId) {
    if(playerId === voterPlayerId) {
      return
    }

    const kickedUser = users.getUser(this.getUser(playerId, true).userId)
    const votingUser = users.getUser(voterPlayerId)
    if(!kickedUser || !votingUser) return

    const votesNeeded = Math.max(Object.keys(this.users).length - 1, 2)

    let votekicks = this.users[kickedUser.id].votekicks
    if(votekicks.includes(votingUser.id)) {
      this.printToUserChat(votingUser.id, [{ text: "You've already voted to kick this user.", style: { colour: "red" } }])
      return
    }
    votekicks.push(votingUser.id)
    this.printToChat([{
      text: `${votingUser.name} has voted to kick ${kickedUser.name}. (${votekicks.length}/${votesNeeded} votes)`,
      style: { colour: "green" }
    }])

    if(votekicks.length >= votesNeeded) {
      this.kick(playerId, true)
    }
  }



  handleChatMessage(user, content) {
    if(content.startsWith("/")) {
      content = content.substring(1)
      const args = content.split(" ")
      const cmd = args.splice(0, 1)[0].toLowerCase()
      
      const errChatStyle = { colour: "red", italic: true }
      const printChatErr = (msg) => this.printToUserChat(user.id, [{
        text: msg,
        style: errChatStyle
      }])

      const hostId = this.getHost()
      if(hostId !== user.id) {
        printChatErr("Only the host is allowed to use commands!")
        return
      }

      switch(cmd) {
        case "kick":
          this.kick(args[0])
          break
        case "skip_setup": // todo: remove this after development is done
          if(!this.game) {
            printChatErr("Not in game!")
            break
          }
          if(this.game.turnCycle <= 2) {
            this.game.turnCycle = 3
            this.printToChat([{
              text: "skipped setup turns or something",
              style: { colour: "green" }
            }])
          }
          break
        case "give_res": // todo: remove this after development is done
          if(!this.game) {
            printChatErr("Not in game!")
            break
          }
          const targetPlayer = this.game.getPlayer(args[0])
          if(!targetPlayer) {
            printChatErr("Invalid player!")
            break
          }
          const allowedResources = ["bricks", "lumber", "wool", "wheat", "ore"]
          const resource = args[1]?.toLowerCase()
          if(!allowedResources.includes(resource)) {
            printChatErr(`Allowed resources: ${JSON.stringify(allowedResources)}`)
            break
          }
          const amount = parseInt(args[2]) || 1
          targetPlayer.resources[resource] += amount
          this.printToUserChat(user.id, [{text: `gave ${amount} of ${resource} to ${targetPlayer.name} (${targetPlayer.id})`}])
          break
        case "reshuffle":
          if(!this.game) {
            printChatErr("Use this command on the first turn when the game has started to reshuffle the board. Note that this command cannot be used after the first turn has ended.")
            break
          }
          if(this.game.turnCycle !== 1) printChatErr("This command can only be used on the first turn.")
          else {
            this.game.board.setup(Object.keys(this.game.players).length)
            this.printToChat([{
              text: `The host, ${user.name}, has reshuffled the board.`,
              style: { colour: "green" }
            }])
          }
          break
        default:
          printChatErr("Invalid command.")
          break
      }
    }
    else {
      const lobbyMember = this.getUser(user.id)
      this.printToChat([
        {
          text: user.getName(),
          icon: lobbyMember.spectator && "/images/icons/spectate.svg",
          style: {
            bold: true,
            colour: lobbyMember.colour,
          }
        },
        { text: content }
      ])
    }
  }

  printToUserChat(userId, lines) {
    const socket = users.getUser(userId).socket
    socket.emit("receive_chat", { lines })
  }

  printToChat(lines) {
    this.broadcast("receive_chat", { lines })
  }

  playSound(sound, userId) {
    if(userId) {
      const socket = users.getUser(userId).socket
      socket.emit("play_sound", { sound })
    } else {
      this.broadcast("play_sound", { sound })
    }
  }

  broadcast(msg, data) {
    for(let userId in this.users) {
      const user = users.getUser(userId)
      user.socket.emit(msg, data)
    }
  }

  getUser(id, byPlayerId) {
    if(!byPlayerId) {
      return this.users[id] || null
    }
    else {
      const foundUsers = Object.keys(this.users).filter(k => this.users[k].playerId === id)
      if(foundUsers.length) return this.users[foundUsers[0]]
      else return null
    }
  }

  getUsers(includeSpectators) {
    if(includeSpectators) {
      return this.users
    } else {
      return Object.keys(this.users)
        .filter(k => !this.users[k].spectator)
        .reduce((res, key) => {
          res[key] = this.users[key]
          return res
        }, {})
    }
  }

  getMaxPlayers() {
    return this.maxPlayers
  }

  getName() {
    return this.name
  }

  getCode() {
    return this.code
  }

  getInGame() {
    return this.inGame
  }

  getHost() {
    for(let userId in this.users) {
      if(this.users[userId].host) {
        return userId
      }
    }
    return null
  }

  setHost(userId) {
    for(let loopUserId in this.users) {
      if(this.users[loopUserId].host) {
        delete this.users[loopUserId].host
        users.getUser(loopUserId).socket.emit("host_change", {
          lostHost: true
        })
      }
    }
    this.users[userId].host = true
    users.getUser(userId).socket.emit("host_change", {
      gainedHost: true
    })
    lobbyHelpers.emitLobbyUpdate(this)
  }

  setInGame(inGame, game) {
    this.inGame = inGame
    lobbyHelpers.emitLobbyUpdate(this)
    if(inGame) {
      this.game = game
      for(const i in this.getUsers()) {
        const user = this.users[i]
        this.game.setPlayer(user.playerId, new Player(user.playerId, this.code, user))
      }
    }

    this.game.tick() // make sure that clients receive the game data before instructing them to load the game
    this.broadcast("game_started_update", { started: inGame }) // broadcast to all clients to load the game
  }

  setUserColour(userId, colour) {
    if(this.takenColours.has(colour)) return

    if(!colour) {
      const availableColours = colourChoices.filter(loopCol => !this.takenColours.has(loopCol))
      colour = availableColours[Math.floor(Math.random() * availableColours.length)]
    }

    if(!colourChoices.includes(colour)) return

    this.takenColours.delete(this.users[userId].colour)
    this.users[userId].colour = colour
    this.takenColours.add(colour)

    lobbyHelpers.emitLobbyUpdate(this)
  }
}

const lobbyHelpers = {
  emitLobbyUpdate: (lobby) => {
    lobby.broadcast("lobby_update", lobbies.getPublicLobbyInfo(lobby.getCode()))
  }
}

module.exports = Lobby