const lobbyPlayerList = document.querySelector("#lobby-player-list")
const lobbyPlayerCountSpan = document.querySelector("#lobby-player-count")
const lobbyMaxPlayerCountSpan = document.querySelector("#lobby-max-player-count")

socket.on("chat", data => {
  notifyUser(`Chat: ${JSON.stringify(data)}`)
})

socket.on("host_change", data => {
  if(data.lostHost) {
    notifyUser("You are no longer the host of this lobby.")
  }
  if(data.gainedHost) {
    notifyUser("You are now the host!")
  }
})

socket.on("user_list_update", data => {
  lobbyPlayerList.innerHTML = ""

  const { users, maxPlayerCount } = data
  for(let user of users) {
    const listEntryDiv = document.createElement("div")

    const listEntryTitleDiv = document.createElement("div")
    listEntryTitleDiv.classList.add(["lobby-player-list-entry-title"])

    const playerNameH = document.createElement("h4")
    playerNameH.appendChild(document.createTextNode(user.name))

    const hostBadge = document.createElement("img")
    hostBadge.src = "/images/host.svg"
    hostBadge.title = "Lobby Host"
    hostBadge.style.height = "1em"

    listEntryTitleDiv.appendChild(playerNameH)
    user.host && listEntryTitleDiv.appendChild(hostBadge)

    listEntryDiv.appendChild(listEntryTitleDiv)

    listEntryDiv.classList.add(["lobby-player-list-entry"])
    listEntryDiv.style.border = "5px solid red"
    listEntryDiv.style.backgroundColor = "#fff"

    lobbyPlayerList.appendChild(listEntryDiv)
  }

  lobbyPlayerCountSpan.textContent = users.length
  lobbyMaxPlayerCountSpan.textContent = maxPlayerCount.toString()
})