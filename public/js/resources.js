const resourceCardsDiv = document.querySelector("#resource-cards")
const resourceDivNames = {
  bricks: "resource-bricks",
  lumber: "resource-lumber",
  wool: "resource-wool",
  wheat: "resource-wheat",
  ore: "resource-ore",
}

const createResourceImg = (resourceName) => {
  const img = document.createElement("img")
  img.src = `/images/resource_cards/${resourceName}.png`
  img.alt = resourceName

  return img
}

const refreshResourceCards = () => {
  if(!resourceCardsDiv.childElementCount) {
    const frag = document.createDocumentFragment()

    for(let resourceName in resourceDivNames) {
      const resourceCard = document.createElement("div")
      resourceCard.className = "resource-card"
      resourceCard.id = resourceDivNames[resourceName]

      const img = createResourceImg(resourceName)

      const h3 = document.createElement("h3")
      h3.className = "resource"

      resourceCard.appendChild(img)
      resourceCard.appendChild(h3)
      frag.appendChild(resourceCard)
    }

    const developmentCardToggle = document.createElement("div")
    developmentCardToggle.className = "resource-card"
    developmentCardToggle.id = "development-card-toggle"
    developmentCardToggle.textContent = "Toggle Development Cards"
    developmentCardToggle.onclick = () => {
      const developmentCardListDiv = document.querySelector("#development-card-list")
      if(!developmentCardListDiv.style.display) developmentCardListDiv.style.display = "none"
      else developmentCardListDiv.style.display = null
    }
    frag.appendChild(developmentCardToggle)

    resourceCardsDiv.appendChild(frag)
  }

  for(let divKey in resourceDivNames) {
    const amtDisplay = document.getElementById(resourceDivNames[divKey]).querySelector(".resource")
    amtDisplay.textContent = currentGameData.me.resources[divKey]
  }
}