const joinLobby = (self, code) => {
  socket.emit("join_lobby", { code }, (err, data) => {
    if(err) notifyUser(err)
    else self.lobbyState = data
  })
}

const createLobby = (self, name) => {
  socket.emit("create_lobby", { name }, (err, data) => {
    if(err) notifyUser(err)
    else self.lobbyState = data
  })
}

const leaveLobby = (self) => {
  if(confirm("Are you sure you want to leave the lobby?")) {
    socket.emit("leave_lobby", {}, (err, data) => {
      if(err) notifyUser(err)
      else self.lobbyState = data
    })
  }
}

const refreshOpenLobbies = (self) => {
  socket.emit("get_lobbies", { max: 9 }, (err, data) => {
    if(err) notifyUser(err)
    else {
      const { lobbies } = data
      self.openLobbies = lobbies
    }
  })
}