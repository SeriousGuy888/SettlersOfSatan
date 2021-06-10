let thisLobbyCode

let allowedColours

socket.on("lobby_update", data => {
    if (!thisLobbyCode) thisLobbyCode = data.code
})

socket.on("change_allowed_colours", data => {
    allowedColours = data.newAllowedColours

    console.log(allowedColours)

    for (let loopButton of document.getElementsByClassName("colour-button")) {
        console.log(loopButton.id)
        if(!allowedColours.includes(loopButton.id) && data.userColour != loopButton.id) {
            loopButton.style.backgroundColor = "gray"
        }
        else {
            loopButton.style.backgroundColor = loopButton.id
        }
    }
})

function colourChoose(button){
    if(allowedColours.includes(button.id)){
        for (let loopButton of document.getElementsByClassName("colour-button")) loopButton.style.border = "2px solid rgb(0, 0, 0)"
        button.style.border = "4px solid rgb(100, 183, 255)"

        socket.emit("choose_colour", {
            colour: button.id,
            lobbyCode: thisLobbyCode
        })
        console.log(allowedColours)
    }
}