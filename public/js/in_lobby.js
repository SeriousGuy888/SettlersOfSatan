const lobbyPlayerList = document.querySelector("#lobby-player-list")
const lobbyPlayerCountSpan = document.querySelector("#lobby-player-count")
const lobbyMaxPlayerCountSpan = document.querySelector("#lobby-max-player-count")

let currentLobbyData

socket.on("lobby_update", data => {
  currentLobbyData = data

  lobbyPlayerList.innerHTML = ""
  const { users, maxPlayerCount } = currentLobbyData

  redrawColourButtons(users)
  for(let user of users) {
    const listEntryDiv = document.createElement("div")

    const listEntryTitleDiv = document.createElement("div")
    listEntryTitleDiv.classList.add(["list-entry-title"])

    const playerNameH = document.createElement("h4")
    playerNameH.appendChild(document.createTextNode(user.name))

    const hostBadge = document.createElement("img")
    hostBadge.src = "/images/icons/host.svg"
    hostBadge.title = "Lobby Host"
    hostBadge.classList.add(["icon-1em"])

    listEntryTitleDiv.appendChild(playerNameH)
    user.host && listEntryTitleDiv.appendChild(hostBadge)

    const playerIdP = document.createElement("p")
    playerIdP.appendChild(document.createTextNode(user.playerId))

    listEntryDiv.appendChild(listEntryTitleDiv)
    listEntryDiv.appendChild(playerIdP)

    listEntryDiv.classList.add(["list-entry"])
    listEntryDiv.style.border = "5px solid " + user.colour

    // i dont know how to fix playerId not being defined when you join a lobby
    // i guess your selected colour is greyed out until you select a new one when you join a lobby
    // im not fixing this lol -billzo
    if(user.playerId === playerId) {
      const userColourButton = document.querySelector(`#colour-button-${user.colour}`)
      userColourButton.style.border = "4px solid rgb(100, 183, 255)"
      userColourButton.disabled = false
    }
    

    lobbyPlayerList.appendChild(listEntryDiv)
  }

  lobbyPlayerCountSpan.textContent = users.length
  lobbyMaxPlayerCountSpan.textContent = maxPlayerCount.toString()
})