const lobbyChatMessagesDiv = document.querySelector("#lobby-chat-messages")
const lobbyChatInput = document.querySelector("#lobby-chat-input")
const lobbyChatSendButton = document.querySelector("#lobby-chat-send-button")

const printToChat = (data) => {
  if(!data.lines) return
  const { lines } = data

  const chatMessageDiv = document.createElement("div")

  const chatMessageContent = document.createElement("p")
  chatMessageContent.textContent = lines.join("\n")

  chatMessageDiv.appendChild(chatMessageContent)
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
    })
  }
})

socket.on("receive_chat", printToChat)