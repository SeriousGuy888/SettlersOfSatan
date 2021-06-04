// const loggedInSection = document.querySelector("#logged-in")
const inLobbySection = document.querySelector("#in-lobby")

const createLobbyPanel = document.querySelector("#create-lobby-panel")
const createLobbyNameInput = document.querySelector("#create-lobby-name-input")
const createLobbyButton = document.querySelector("#create-lobby-button")
const joinLobbyPanel = document.querySelector("#join-lobby-panel")
const joinLobbyCodeInput = document.querySelector("#join-lobby-code-input")
const joinLobbyButton = document.querySelector("#join-lobby-button")

const openLobbiesRefreshButton = document.querySelector("#open-lobbies-refresh")
const openLobbiesDiv = document.querySelector("#open-lobbies")

const leaveLobbyButton = document.querySelector("#leave-lobby")



const updateLobbyState = (inLobby) => {
  if(inLobby) {
    loggedInSection.style.display = "none"
    inLobbySection.style.display = null
  }
  else {
    loggedInSection.style.display = null
    inLobbySection.style.display = "none"
  }
}

const socketCallback = (err, data) => {
  if(err) alert(err)
  else {
    updateLobbyState(!!data.code)
  }
}



createLobbyButton.addEventListener("click", () => {
  const lobbyName = createLobbyNameInput.value

  socket.emit("create_lobby", {
    name: lobbyName
  }, socketCallback)
})

joinLobbyButton.addEventListener("click", () => {
  const lobbyCode = joinLobbyCodeInput.value

  socket.emit("join_lobby", {
    code: lobbyCode
  }, socketCallback)
})

leaveLobbyButton.addEventListener("click", () => {
  socket.emit("leave_lobby", {}, socketCallback)
})

openLobbiesRefreshButton.addEventListener("click", () => {
  socket.emit("get_lobbies", { max: 5 }, (err, data) => {
    if(err) alert(err)
    else {
      openLobbiesDiv.innerHTML = ""

      const { lobbies } = data
      if(lobbies.length) {
        for(let lobbyInfo of lobbies) {
          const listEntryDiv = document.createElement("div")
          const lobbyNameP = document
            .createElement("p")
            .appendChild(document.createTextNode(JSON.stringify(lobbyInfo)))
          listEntryDiv.appendChild(lobbyNameP)
      
          listEntryDiv.classList.add(["open-lobbies-entry"])
          openLobbiesDiv.appendChild(listEntryDiv)
        }
      }
      else {
        openLobbiesDiv.textContent = "There are no open lobbies right now :("
      }
    }
  })
})