const editLobbySetting = (self, changes) => {
  socket.emit("edit_lobby_setting", changes, (err, data) => {
    if(err) notifyUser(err)
  })
}