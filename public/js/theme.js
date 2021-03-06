const darkThemeToggle = document.querySelector("#dark-theme-toggle")

const setDarkTheme = (enabled) => {
  localStorage.setItem("darkTheme", enabled)
  document.body.classList.toggle("dark-theme", enabled)
  if(darkThemeToggle) {
    darkThemeToggle.textContent = enabled ? "🌞" : "🌛"
  }
}
const getDarkTheme = () => localStorage.getItem("darkTheme") === "true" // localstorage only takes strings :(
setDarkTheme(getDarkTheme())

if(darkThemeToggle) darkThemeToggle.addEventListener("click", () => {
  let enabled = getDarkTheme()
  setDarkTheme(!enabled)
})