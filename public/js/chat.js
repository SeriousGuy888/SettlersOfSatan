const lobbyChatMessagesDiv = document.querySelector("#lobby-chat-messages")
const lobbyChatInput = document.querySelector("#lobby-chat-input")
const lobbyChatSendButton = document.querySelector("#lobby-chat-send-button")


const scrollChatToBottom = () => lobbyChatMessagesDiv.scrollTop = lobbyChatMessagesDiv.scrollHeight
const parseChatLine = (line) => {
  const content = document.createElement("div")
  content.className = "chat-message-content"

  if(typeof line === "object") {
    const contentP = document.createElement("p")
    if(line.text) {
      contentP.textContent = line.text
      if(line.style) {
        contentP.style["font-weight"] = line.style?.bold ? "bold" : "normal"
        contentP.style["font-style"] = line.style?.italic ? "italic" : "normal"
        contentP.style.color = line.style?.colour
      }
      content.appendChild(contentP)
    }
    if(line.dice) {
      const contentDice = document.createElement("div")
      contentDice.classList = "chat-message-dice"
      
      for(const num of line.dice) {
        const imgElem = document.createElement("img")
        imgElem.src = `/images/dice/${num}.svg`

        contentDice.appendChild(imgElem)
      }
      content.appendChild(contentDice)
    }
  }
  else {
    const contentP = document.createElement("p")
    contentP.textContent = line
    content.appendChild(contentP)
  }

  return content
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