    const cardDescriptions = {
    "knight": "Move the robber",
    "road building": "Place two free roads",
    "year of plenty": "Take two resources of your choice from the stockpile",
    "monopoly": "Steal all of a specified resource from players",
    "victory point": "Free victory point"
}

function refreshDevelopmentCards() {

    document.getElementById("development-card-list").innerHTML = ""

    let i = 0   

    for(let developmentCard of currentGameData.me.inventory.developmentCards){
        console.log(developmentCard)
        let cardImg = document.createElement("img")
        cardImg.alt = "card icon"
        cardImg.className = "card-icon"

        if(developmentCard.type == "knight") {
            cardImg.src = `../images/development_cards/knight_${developmentCard.knightType}.png`
        }
        else {
            cardImg.src = `../images/development_cards/${developmentCard.type.replaceAll(" ", "_")}.png`
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

        description.style = "flex: 2 0 0;"

        let useButton = document.createElement("button")
        let useButtonText = document.createTextNode("Use")
        useButton.appendChild(useButtonText)

        useButton.style = "flex: 1 0 0; height: 2rem;"
        useButton.id = "use-card-button"

        useButton.addEventListener("click",  () => {
            socket.emit("perform_game_action", {
                action: "use_development_card",
                card: developmentCard
            }, (err, data) => {
                if(err) notifyUser(err)
            })
        }
        )
        let card = document.createElement("div")
        card.className = "card"
    
        let mainCardDiv = document.createElement("div")

        mainCardDiv.style = "display: flex;"

        mainCardDiv.appendChild(description)
        mainCardDiv.appendChild(useButton)

        card.appendChild(headerDiv)
        card.appendChild(mainCardDiv)

        document.getElementById("development-card-list").appendChild(card)
        i++
    }

//     function useCard(card){
}