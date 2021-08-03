const cardDescriptions = {
    "knight": "Move the robber",
    "road building": "Place two free roads",
    "year of plenty": "Take two resources of your choice from the stockpile",
    "monopoly": "Steal all of a specified resource from players",
    "victory point": "Free victory point"
}

function refreshDevelopmentCards() {

    document.getElementById("development-card-list").innerHTML = ""

    for(developmentCard of currentGameData.me.inventory.developmentCards){
        console.log(developmentCard)
        let cardImg = document.createElement("img")
        cardImg.alt = "card icon"
        cardImg.className = "card-icon"

        if(developmentCard.type == "knight") {
            cardImg.src = `../images/development_cards/knight_${developmentCard.knightType}.png`
        }
        else {
            cardImg.src = "../images/resource_cards/wool.png"
        }

        let headerH2 = document.createElement("h2")
        headerH2.className = "card-header"
        let headerH2Node = document.createTextNode(developmentCard.type)
        headerH2.appendChild(headerH2Node)

        let headerDiv = document.createElement("div")
        headerDiv.className = "card-header"

        headerDiv.appendChild(headerH2)
        headerDiv.appendChild(cardImg)

        let description = document.createElement("p")

        if (developmentCard.victoryPoint){
            var descriptionNode = document.createTextNode(cardDescriptions["victory point"])
        }

        else {
            var descriptionNode = document.createTextNode(cardDescriptions[developmentCard.type])
        }

        description.appendChild(descriptionNode)

        let card = document.createElement("div")
        card.className = "card"
    
        card.appendChild(headerDiv)
        card.appendChild(description)

        document.getElementById("development-card-list").appendChild(card)
    }

}