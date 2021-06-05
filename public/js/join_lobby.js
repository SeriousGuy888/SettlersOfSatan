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

const lobbyNameHeader = document.querySelector("#lobby-name")
const leaveLobbyButton = document.querySelector("#leave-lobby")


const updateLobbyState = (data) => {
  const inLobby = !!data.code

  if(inLobby) {
    loggedInSection.style.display = "none"
    inLobbySection.style.display = null
    lobbyNameHeader.textContent = data.name
  }
  else {
    loggedInSection.style.display = null
    inLobbySection.style.display = "none"
  }
  
  toggleLobbySettingsLocked(false)
}

const socketCallback = (err, data) => {
  if(err) notifyUser(err)
  else {
    updateLobbyState(data)
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
  socket.emit("get_lobbies", { max: 9 }, (err, data) => {
    if(err) notifyUser(err)
    else {
      openLobbiesDiv.innerHTML = ""

      const { lobbies } = data
      if(lobbies.length) {
        for(let lobbyInfo of lobbies) {
          const listEntryDiv = document.createElement("div")

          const listEntryTitleDiv = document.createElement("div")
          listEntryTitleDiv.classList.add(["open-lobbies-entry-title"])

          const lobbyNameH = document.createElement("h3")
          lobbyNameH.appendChild(document.createTextNode(lobbyInfo.name))
          const joinOpenLobbyButton = document.createElement("button")
          joinOpenLobbyButton.textContent = "Join"
          joinOpenLobbyButton.onclick = () => {
            socket.emit("join_lobby", {
              code: lobbyInfo.code
            }, socketCallback)
          }

          listEntryTitleDiv.appendChild(lobbyNameH)
          listEntryTitleDiv.appendChild(joinOpenLobbyButton)

          const lobbyCodeP = document.createElement("p")
          lobbyCodeP.innerHTML = `Code: <code>${lobbyInfo.code}</code>`

          const lobbyPlayerCountP = document.createElement("p")
          lobbyPlayerCountP.innerHTML = `Players: <code>${lobbyInfo.playerCount}/${lobbyInfo.maxPlayerCount}</code>`

          listEntryDiv.appendChild(listEntryTitleDiv)
          listEntryDiv.appendChild(lobbyCodeP)
          listEntryDiv.appendChild(lobbyPlayerCountP)
      
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