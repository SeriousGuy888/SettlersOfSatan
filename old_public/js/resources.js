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

let prevResourceData = {}
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

    resourceCardsDiv.appendChild(frag)
  }

  for(let divKey in resourceDivNames) {
    const currentAmt = currentGameData.me.resources[divKey]
    const prevAmt = prevResourceData[divKey]

    const displayCard = document.getElementById(resourceDivNames[divKey])
    displayCard.classList.remove("green-pulse", "red-pulse")
    if(currentAmt !== prevAmt) {
      if(currentAmt > prevAmt) displayCard.classList.add("green-pulse")
      if(currentAmt < prevAmt) displayCard.classList.add("red-pulse")
    }
    setTimeout(() => displayCard.classList.remove("green-pulse", "red-pulse"), 3000)

    const amtDisplay = displayCard.querySelector(".resource")
    amtDisplay.textContent = `${currentGameData.me.resources[divKey]} [${currentGameData.stockpile[divKey]}]`
  }

  prevResourceData = currentGameData.me.resources
}