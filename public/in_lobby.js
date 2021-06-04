const lobbyPlayerList = document.querySelector("#lobby-player-list")

socket.on("chat", data => {
  alert(`Chat: ${JSON.stringify(data)}`)
})

socket.on("user_list_update", data => {
  alert(JSON.stringify(data))
})