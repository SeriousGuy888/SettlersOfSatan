function colourChoose(button){
    for (let loopButton of document.getElementsByClassName("colour-button")) loopButton.style.border = "2px solid rgb(0, 0, 0)"
    button.style.border = "4px solid rgb(100, 183, 255)"
    socket.emit("choose_colour", {
        users: Object.values(self.users), // do not reveal user ids
        maxPlayerCount: self.getMaxPlayers(),
        colour: button.id
        }, (err, data) => {
        if(err) notifyUser(err)
    })
}