const loggedOutSection = document.querySelector("#logged-out")
const nicknameInput = document.querySelector("#nickname-input")
const loginButton = document.querySelector("#login-button")

const loggedInSection = document.querySelector("#logged-in")
const loggedInNickname = document.querySelector("#logged-in-nickname")
const loggedInId = document.querySelector("#logged-in-id")
const logoutButton = document.querySelector("#logout-button")

const playingAs = document.querySelector("#playing-as")


const updateLoggedInState = (loggedIn, name, id) => {
  if(loggedIn) {
    loggedOutSection.style.display = "none"
    loggedInSection.style.display = null
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
    else updateLoggedInState(true, data.name, socket.id)
  })
})

logoutButton.addEventListener("click", () => {
  socket.emit("logout", {}, (err, data) => {
    if(err) notifyUser(err)
    else updateLoggedInState(false)
  })
})