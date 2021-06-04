// const loggedInSection = document.querySelector("#logged-in")
const inLobbySection = document.querySelector("#in-lobby")

const createLobbyPanel = document.querySelector("#create-lobby-panel")
const createLobbyNameInput = document.querySelector("#create-lobby-name-input")
const createLobbyButton = document.querySelector("#create-lobby-button")
const joinLobbyPanel = document.querySelector("#join-lobby-panel")
const joinLobbyCodeInput = document.querySelector("#join-lobby-code-input")
const joinLobbyButton = document.querySelector("#join-lobby-button")



const updateLobbyState = (inLobby) => {
  loggedInSection.style.display = inLobby ? "none" : "block"
  inLobbySection.style.display = inLobby ? "block" : "none"
}


createLobbyButton.addEventListener("click", () => {
  const lobbyName = createLobbyNameInput.value

  socket.emit("create_lobby", {
    name: lobbyName
  }, (err, data) => {
    if(err) alert(err)
    else {
      updateLobbyState(true)
    }
  })
})

joinLobbyButton.addEventListener("click", () => {
  alert("join lobby button")
})