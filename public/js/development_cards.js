const developmentCardToggle = document.querySelector("#development-card-toggle")
const developmentCardListDiv = document.querySelector("#development-card-list")

developmentCardToggle.addEventListener("click", () => {
  developmentCardListDiv.style.display = "none"
})