const developmentCardToggle = document.querySelector("#development-card-toggle")
const developmentCardListDiv = document.querySelector("#development-card-list")

developmentCardToggle.addEventListener("click", () => {
  if(!developmentCardListDiv.style.display) {
    developmentCardListDiv.style.display = "none"
  }
  else {
    developmentCardListDiv.style.display = null
  }
})