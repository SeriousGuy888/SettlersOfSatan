const { Socket } = require("socket.io")
const lobbies = require("./lobbies.js")
const users = require("./users.js")

/**
 * @param {string} input 
 * @param {boolean} trim 
 * @param {number} maxLength 
 * @returns string
 */
exports.goodifyUserInput = (input, trim, maxLength) => {
  let output = input
  if(trim) output = output?.trim()
  if(maxLength) output = output?.slice(0, maxLength)

  return output
}

/**
 * 
 * @param {Function} callback 
 * @param {Socket} socket 
 * @param {Object} options
 * @param {boolean} options.requireCallback 
 * @param {boolean} options.requireUser 
 * @param {boolean} options.requireLobby 
 * @param {boolean} options.requireHost 
 * @returns 
 */
exports.validateRequest = (callback, socket, options) => {
  let returnObj = {}

  if(options) {
    if(options.requireCallback) {
      if(!callback) return false
    }
    if(options.requireUser) {
      const user = users.getUser(socket.id)
      if(!user) return callback("not_logged_in")
      returnObj.user = user
    }
    if(options.requireLobby) {
      if(returnObj.user) {
        const { user } = returnObj

        const lobbyCode = user.getLobby()
        if(!lobbyCode) return callback("not_in_lobby")

        const lobby = lobbies.getLobby(lobbyCode)
        if(!lobby) return callback("lobby_not_found")

        returnObj.lobby = lobby
      }
    }
    if(options.requireHost) {
      if(returnObj.user && returnObj.lobby) {
        const { user, lobby } = returnObj
        if(lobby.getHost() !== user.id) return callback("no_host_permission")
      }
    }
  }

  return returnObj
}