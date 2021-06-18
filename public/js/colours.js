const colourButtonsContainer = document.querySelector("#colour-buttons-container")

const redrawColourButtons = (users) => {
  const colourChoices = ["red", "white", "blue", "orange", "green", "purple", "brown", "pink"]
  colourButtonsContainer.innerHTML = ""

  const docFrag = document.createDocumentFragment()
  for(const colour of colourChoices) {
    const colourButton = document.createElement("button")
    colourButton.className = "colour-button"
    colourButton.id = `colour-button-${colour}`
    colourButton.style.backgroundColor = colour
    colourButton.textContent = colour
    
    if(colour === "white") colourButton.style.color = "black"
  
    colourButton.onclick = () => {
      socket.emit("select_colour", { colour }, (err, data) => {
        if(err) notifyUser(err)
      })
    }
  
    docFrag.appendChild(colourButton)
  }
  colourButtonsContainer.appendChild(docFrag)

  if(!users) users = []
  for(const user of users) {
    const userColourButton = document.querySelector(`#colour-button-${user.colour}`)
    userColourButton.disabled = true
  }
}

redrawColourButtons()