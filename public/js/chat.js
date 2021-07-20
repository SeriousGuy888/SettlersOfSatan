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
    if(line.trade) {
      const contentTrade = document.createElement("div")
      
      const trade = line.trade
      const idempotency = trade.idempotency
      const { offererGives, takerGives } = trade.offer

      const p = document.createElement("p")
      p.textContent = `${currentGameData.players[currentGameData.turn].name} offers to trade their ${JSON.stringify(offererGives)} for ${JSON.stringify(takerGives)}.`
      const button = document.createElement("button")
      button.textContent = "Accept Trade"
      button.onclick = () => {
        socket.emit("perform_game_action", {
          action: "accept_trade",
          idempotency
        }, (err, data) => {
          if(err) notifyUser(err)
        })
      }

      contentTrade.appendChild(p)
      contentTrade.appendChild(button)

      content.appendChild(contentTrade)
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

  for(let line of lines) {
    const chatMessageContentLine = parseChatLine(line)
    chatMessageContentLine && chatMessageDiv.appendChild(chatMessageContentLine)
  }

  const shouldScroll = lobbyChatMessagesDiv.scrollTop + lobbyChatMessagesDiv.clientHeight === lobbyChatMessagesDiv.scrollHeight
  lobbyChatMessagesDiv.appendChild(chatMessageDiv)
  if(shouldScroll) scrollChatToBottom()

  if(lobbyChatMessagesDiv.childElementCount > 250) {
    lobbyChatMessagesDiv.removeChild(lobbyChatMessagesDiv.children[0])
  }
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