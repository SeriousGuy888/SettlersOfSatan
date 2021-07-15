const lobbyChatMessagesDiv = document.querySelector("#lobby-chat-messages")
const lobbyChatInput = document.querySelector("#lobby-chat-input")
const lobbyChatSendButton = document.querySelector("#lobby-chat-send-button")


const scrollChatToBottom = () => lobbyChatMessagesDiv.scrollTop = lobbyChatMessagesDiv.scrollHeight
const parseChatLine = (line) => {
  const chatMessageContentLine = document.createElement("p")
  if(typeof line === "object") {
    if(!line.text) return
    chatMessageContentLine.textContent = line.text
    if(line.style) {
      chatMessageContentLine.style["font-weight"] = line.style?.bold ? "bold" : "normal"
      chatMessageContentLine.style["font-style"] = line.style?.italic ? "italic" : "normal"
      chatMessageContentLine.style.color = line.style?.colour
    }
  }
  else chatMessageContentLine.textContent = line
  return chatMessageContentLine
}
const printToChat = (lines) => {
  const chatMessageDiv = document.createElement("div")

  if(lobbyChatMessagesDiv.childElementCount >= 250) {
    lobbyChatMessagesDiv.removeChild(lobbyChatMessagesDiv.children[0])
  }

  for(let line of lines) {
    const chatMessageContentLine = parseChatLine(line)
    chatMessageContentLine && chatMessageDiv.appendChild(chatMessageContentLine)
  }

  const shouldScroll = lobbyChatMessagesDiv.scrollTop + lobbyChatMessagesDiv.clientHeight === lobbyChatMessagesDiv.scrollHeight
  lobbyChatMessagesDiv.appendChild(chatMessageDiv)
  if(shouldScroll) scrollChatToBottom()
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
      if(err) printToChat([{
        text: err,
        style: {
          colour: "red",
          italic: true,
        }
      }])
    })
  }
})

socket.on("receive_chat", data => printToChat(data.lines))