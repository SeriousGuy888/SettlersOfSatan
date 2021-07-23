const darkThemeToggle = document.querySelector("#dark-theme-toggle")

const setDarkTheme = (enabled) => {
  localStorage.setItem("darkTheme", enabled)
  document.body.classList.toggle("dark-theme", enabled)
  darkThemeToggle.textContent = enabled ? "🌞 Light Theme" : "🌛 Dark Theme"
}
const getDarkTheme = () => localStorage.getItem("darkTheme") === "true" // localstorage only takes strings :(
setDarkTheme(getDarkTheme())

darkThemeToggle.addEventListener("click", () => {
  let enabled = getDarkTheme()
  setDarkTheme(!enabled)
})
