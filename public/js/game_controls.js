const gameControls = {
  settlement: document.querySelector("#settlement-button"),
  city: document.querySelector("#city-button"),
  road: document.querySelector("#road-button"),
  developmentCard: document.querySelector("#development-card-button"),
  trade: document.querySelector("#trade-button"),
}
const endTurnButton = document.querySelector("#end-turn-button")

let holding = null
const setHolding = name => {
  if(holding === name) holding = null
  else holding = name
}

gameControls.settlement.addEventListener("click", () => setHolding("settlement"))
gameControls.city.addEventListener("click", () => setHolding("city"))
gameControls.road.addEventListener("click", () => setHolding("road"))

endTurnButton.addEventListener("click", () => {
  socket.emit("perform_game_action", {
    action: "end_turn" 
  }, (err, data) => {
    if(err) notifyUser(err)
  })
})