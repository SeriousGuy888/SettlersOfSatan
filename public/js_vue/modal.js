const toggleModal = (self, active, data) => {
  self.playerListModal.show = active
  self.playerListModal.data = data
}

const kickPlayer = (self, playerId, votekick) => {
  if(window.confirm(`${votekick ? "Votekick" : "Kick"} this player?`)) {
    socket.emit(votekick ? "votekick_player" : "kick_player", {
      playerId
    }, (err, data) => {
      if(err) notifyUser(err)
    })
  }
}