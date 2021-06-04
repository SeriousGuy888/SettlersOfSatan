const lobbyPlayerList = document.querySelector("#lobby-player-list")

socket.on("chat", data => {
  alert(`Chat: ${JSON.stringify(data)}`)
})

socket.on("user_list_update", data => {
  lobbyPlayerList.innerHTML = ""

  const { users } = data
  for(let user of users) {

    const listEntryDiv = document.createElement("div")

    const playerNameP = document.createElement("p")
    playerNameP.appendChild(document.createTextNode(user))
    
    listEntryDiv.appendChild(playerNameP)

    listEntryDiv.classList.add(["lobby-player-list-entry"])
    listEntryDiv.style.border = "5px solid red"

    lobbyPlayerList.appendChild(listEntryDiv)
  }
})