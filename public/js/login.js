const loggedOutSection = document.querySelector("#logged-out")
const nicknameInput = document.querySelector("#nickname-input")
const loginButton = document.querySelector("#login-button")

const loggedInSection = document.querySelector("#logged-in")
const loggedInNickname = document.querySelector("#logged-in-nickname")
const loggedInId = document.querySelector("#logged-in-id")
const logoutButton = document.querySelector("#logout-button")

const playingAs = document.querySelector("#playing-as")


const updateLoggedInState = (loggedIn, name) => {
  if(loggedIn) {
    loggedOutSection.style.display = "none"
    loggedInSection.style.display = null
    
    const hashFrag = window.location.hash.slice(1)
    const lobbyCodeIndicator = "lobby="
    if(hashFrag.startsWith(lobbyCodeIndicator)) {
      let lobbyCode = hashFrag.slice(lobbyCodeIndicator.length)
      joinLobby(lobbyCode)
    }
  }
  else {
    loggedOutSection.style.display = null
    loggedInSection.style.display = "none"
  }

  playingAs.style.display = loggedIn ? "block" : "none"
  loggedInNickname.textContent = name
}

loginButton.addEventListener("click", () => {
  const name = nicknameInput.value
  // const id = `${Date.now()}${Math.round(Math.random() * 1000).toString().padStart(3, "0")}`

  socket.emit("login", {
    name,
  }, (err, data) => {
    if(err) notifyUser(err)
    else updateLoggedInState(true, data.name)
  })
})

logoutButton.addEventListener("click", () => {
  socket.emit("logout", {}, (err, data) => {
    if(err) notifyUser(err)
    else updateLoggedInState(false)
  })
})

socket.on("disconnect", () => {
  alert("You were disconnected from the game server! The server may be restarting.\n\nClick OK to reload.")
  window.location.reload()
})