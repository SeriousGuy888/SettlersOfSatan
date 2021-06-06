let thisLobbyCode

socket.on("lobby_update", data => {
    if (!thisLobbyCode) thisLobbyCode = data.code
})

function colourChoose(button){
    for (let loopButton of document.getElementsByClassName("colour-button")) loopButton.style.border = "2px solid rgb(0, 0, 0)"
    button.style.border = "4px solid rgb(100, 183, 255)"

    socket.emit("choose_colour", {
        colour: button.id,
        lobbyCode: thisLobbyCode
    })
}