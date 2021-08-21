const colourButtonsContainer = document.querySelector("#colour-buttons-container")
const colourHexagonButtons = colourButtonsContainer.querySelectorAll(".hexagon")

let colourChoices = []
socket.emit("get_colour_choices", {}, (err, data) => {
  if(err) notifyUser(err)
  colourChoices = data.colourChoices
})

const redrawColourButtons = () => {
  for(let i = 0; i < colourChoices.length; i++) {
    const colour = colourChoices[i]
    const colourButton = colourHexagonButtons[i]
    const colourButtonText = colourButton.querySelector(".hexagon-content")

    colourButton.classList.remove("active", "disabled")
    colourButton.id = `colour-button-${colour}`
    colourButton.style.backgroundColor = colour
    colourButtonText.textContent = colour.toUpperCase()
  
    colourButton.onclick = () => {
      if(colourButton.classList.contains("active")) {
        printToChat([{ text: "You have already have that colour selected.", style: { colour: "red", italic: true } }])
        return
      }
      if(colourButton.classList.contains("disabled")) {
        printToChat([{ text: "Another player is using this colour.", style: { colour: "red", italic: true } }])
        return
      }

      socket.emit("select_colour", { colour }, (err, data) => {
        if(err) notifyUser(err)
      })
    }
  }

  const users = currentLobbyData?.users || []
  for(const user of users) {
    const userColourButton = document.querySelector(`#colour-button-${user.colour}`)
    if(user.playerId === playerId) {
      userColourButton.classList.add("active")
    }
    else {
      userColourButton.classList.add("disabled")
    }
  }
}

redrawColourButtons()