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

const refreshPlayerList = () => {
  lobbyPlayerList.innerHTML = ""
  const { users, maxPlayerCount } = currentLobbyData
  const players = currentGameData?.players

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

    const hostBadge = document.createElement("img")
    hostBadge.src = "/images/icons/host.svg"
    hostBadge.title = "Lobby Host"
    hostBadge.classList.add(["icon-1em"])

    const playerNameH = document.createElement("h4")
    playerNameH.textContent = user.name

    const playerVpDisplay = document.createElement("p")
    if(players) playerVpDisplay.textContent = `${players[user.playerId]?.points}VP`

    const confirmTradeButton = document.createElement("button")
    confirmTradeButton.textContent = "Trade"
    confirmTradeButton.onclick = () => {
      socket.emit("perform_game_action", {
        action: "confirm_trade",
        tradeWith: user.playerId
      }, (err, data) => {
        if(err) notifyUser(err)
      })
    }

    if(user.host) listEntryTitleDiv.appendChild(hostBadge)
    listEntryTitleDiv.appendChild(playerNameH)
    if(currentGameData) {
      listEntryTitleDiv.appendChild(playerVpDisplay)
      if(currentGameData.turn === currentGameData.me.id && currentGameData.trade.takers?.includes(user.playerId)) {
        listEntryTitleDiv.appendChild(confirmTradeButton)
      }
    }

    
    const playerMenuButton = document.createElement("span")
    playerMenuButton.textContent = "⋮"
    playerMenuButton.className = "player-list-modal-button"
    playerMenuButton.onclick = () => {
      modal.style.display = "block"

      modalTitle.textContent = user.name
      user.host && modalTitle.appendChild(hostBadge.cloneNode())
      
      modalButtons.innerHTML = ""

      if(user.playerId !== playerId) {
        const votekickButton = document.createElement("button")
        votekickButton.textContent = "Votekick"
        votekickButton.onclick = () => {
          socket.emit("votekick_player", {
            playerId: user.playerId
          }, (err, dat) => { if(err) notifyUser(err) })
          
          modal.style.display = "none"
        }
        modalButtons.appendChild(votekickButton)

        if(isHost) {
          const kickPlayerButton = document.createElement("button")
          kickPlayerButton.classList.add("red-button")
          kickPlayerButton.textContent = "Kick"
          kickPlayerButton.onclick = () => {
            if(window.confirm(`Are you sure you want to kick ${user.name}?`)) {
              socket.emit("kick_player", {
                playerId: user.playerId
              }, (err, dat) => {
                if(err) notifyUser(err)
              })
            }
            modal.style.display = "none"
          }
          modalButtons.appendChild(kickPlayerButton)
        }
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
}