const lobbyChatMessagesDiv = document.querySelector("#lobby-chat-messages")
const lobbyChatInput = document.querySelector("#lobby-chat-input")
const lobbyChatSendButton = document.querySelector("#lobby-chat-send-button")

const printToChat = (lines) => {
  const chatMessageDiv = document.createElement("div")

  for(let line of lines) {
    const chatMessageContentLine = document.createElement("p")
    chatMessageContentLine.textContent = line
    chatMessageDiv.appendChild(chatMessageContentLine)
  }

  lobbyChatMessagesDiv.appendChild(chatMessageDiv)
}


lobbyChatInput.addEventListener("keyup", e => {
  if(e.key === "Enter") {
    lobbyChatSendButton.click()
  }
})

lobbyChatSendButton.addEventListener("click", () => {
  const messageContent = lobbyChatInput.value
  lobbyChatInput.value = ""
  if(messageContent) {
    socket.emit("send_chat", {
      content: messageContent
    }, (err, data) => {
      if(err) printToChat([err])
    })
  }
})

socket.on("receive_chat", data => printToChat(data.lines))