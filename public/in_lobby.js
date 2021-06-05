const lobbyPlayerList = document.querySelector("#lobby-player-list")

socket.on("chat", data => {
  alert(`Chat: ${JSON.stringify(data)}`)
})

socket.on("user_list_update", data => {
  lobbyPlayerList.innerHTML = ""

  const { users } = data
  for(let user of users) {
    const listEntryDiv = document.createElement("div")

    const listEntryTitleDiv = document.createElement("div")
    listEntryTitleDiv.classList.add(["lobby-player-list-entry-title"])

    const playerNameH = document.createElement("h4")
    playerNameH.appendChild(document.createTextNode(user.name))

    const hostBadge = document.createElement("p")
    hostBadge.appendChild(document.createTextNode(user.host ? "👑" : ""))

    listEntryTitleDiv.appendChild(hostBadge)
    listEntryTitleDiv.appendChild(playerNameH)

    listEntryDiv.appendChild(listEntryTitleDiv)

    listEntryDiv.classList.add(["lobby-player-list-entry"])
    listEntryDiv.style.border = "5px solid red"
    listEntryDiv.style.backgroundColor = "#fff"

    lobbyPlayerList.appendChild(listEntryDiv)
  }
})