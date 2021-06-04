const loggedOutDiv = document.querySelector("#logged-out")
const nicknameInput = document.querySelector("#nickname-input")
const loginButton = document.querySelector("#login-button")

const loggedInDiv = document.querySelector("#logged-in")
const loggedInNickname = document.querySelector("#logged-in-nickname")
const loggedInId = document.querySelector("#logged-in-id")
const logoutButton = document.querySelector("#logout-button")


const updateLoggedInState = (loggedIn, name, id) => {
  loggedOutDiv.style.display = loggedIn ? "none" : "block"
  loggedInDiv.style.display = loggedIn ? "block" : "none"
  loggedInNickname.textContent = name
  loggedInId.textContent = id
}

loginButton.addEventListener("click", () => {
  const name = nicknameInput.value
  // const id = `${Date.now()}${Math.round(Math.random() * 1000).toString().padStart(3, "0")}`

  socket.emit("login", {
    name,
  }, (err, data) => {
    if(err) alert(err)
    else updateLoggedInState(true, data.name, socket.id)
  })
})

logoutButton.addEventListener("click", () => {
  socket.emit("logout", {}, (err, data) => {
    if(err) alert(err)
    else updateLoggedInState(false)
  })
})