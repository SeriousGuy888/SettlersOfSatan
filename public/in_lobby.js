socket.on("chat", data => {
  alert(`Chat: ${JSON.stringify(data)}`)
})