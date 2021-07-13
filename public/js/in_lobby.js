const lobbyPlayerList = document.querySelector("#lobby-player-list")
const lobbyPlayerCountSpan = document.querySelector("#lobby-player-count")
const lobbyMaxPlayerCountSpan = document.querySelector("#lobby-max-player-count")

const modal = document.querySelector("#player-list-modal")
const modalClose = modal.querySelector(".modal-content > .modal-close")
const modalTitle = modal.querySelector(".modal-content > .modal-title")
const modalButtons = modal.querySelector(".modal-content > .modal-buttons")

modalClose.addEventListener("click", () => modal.style.display = "none")
document.addEventListener("click", e => {
  if(e.target === modal) modal.style.display = "none"
})


let currentLobbyData
socket.on("lobby_update", data => {
  currentLobbyData = data

  lobbyPlayerList.innerHTML = ""
  const { users, maxPlayerCount } = currentLobbyData

  redrawColourButtons(users)

  let isHost = false
  users.forEach(u => {
    if(u.playerId === playerId && u.host) {
      isHost = true
    }
  })

  const docFrag = document.createDocumentFragment()
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

    const playerMenuButton = document.createElement("span")
    playerMenuButton.textContent = "⋮"
    playerMenuButton.className = "player-list-modal-button"
    playerMenuButton.onclick = () => {
      modal.style.display = "block"

      modalTitle.textContent = user.name
      
      modalButtons.innerHTML = ""
      if(isHost && user.playerId !== playerId) {
        const kickPlayerButton = document.createElement("button")
        kickPlayerButton.textContent = "Kick"
        kickPlayerButton.onclick = () => {
          if(window.confirm(`Are you sure you want to kick ${user.name}?`)) {
            socket.emit("kick_player", {
              playerId: user.playerId
            }, (err, dat) => {
              if(err) notifyUser(err)
            })
          }
        }
        modalButtons.appendChild(kickPlayerButton)
      }

      const copyPlayerIdButton = document.createElement("button")
      const copyPlayerIdButtonText = "Copy Player ID"
      copyPlayerIdButton.textContent = copyPlayerIdButtonText
      copyPlayerIdButton.onclick = () => {
        navigator.clipboard.writeText(user.playerId).then(() => {
          copyPlayerIdButton.textContent = "Copied!"
          setTimeout(() => copyPlayerIdButton.textContent = copyPlayerIdButtonText, 1000)
        })
      }
      modalButtons.appendChild(copyPlayerIdButton)
    }

    listEntryTitleDiv.appendChild(playerMenuButton)
    listEntryDiv.appendChild(listEntryTitleDiv)

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
    

    docFrag.appendChild(listEntryDiv)
  }
  lobbyPlayerList.appendChild(docFrag)

  lobbyPlayerCountSpan.textContent = users.length
  lobbyMaxPlayerCountSpan.textContent = maxPlayerCount.toString()
})