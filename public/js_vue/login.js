const login = (self, logout) => {
  if(logout) {
    socket.emit("logout", null, (err, data) => {
      console.log(err)
      if(!err) self.loginState.loggedIn = false
    })
  }
  else {
    socket.emit("login", {
      name: self.loginState.name
    }, (err, data) => {
      if(!err) {
        self.loginState.loggedIn = true
        self.loginState.name = data.name
      }
    })
  }
}