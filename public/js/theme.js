const darkThemeToggle = document.querySelector("#dark-theme-toggle")

const setDarkTheme = (enabled) => {
  localStorage.setItem("darkTheme", enabled)
  document.body.classList.toggle("dark-theme", enabled)
  if(darkThemeToggle) {
    let themeTexts = ["Light Theme", "Dark Theme"]
    if(creditsLang === "billzonian") themeTexts = ["Bruiht Ceme", "Nuiht Ceme"]
    darkThemeToggle.textContent = enabled ? "🌞 " + themeTexts[0] : "🌛 " + themeTexts[1]
  }
}
const getDarkTheme = () => localStorage.getItem("darkTheme") === "true" // localstorage only takes strings :(
setDarkTheme(getDarkTheme())

if(darkThemeToggle) darkThemeToggle.addEventListener("click", () => {
  let enabled = getDarkTheme()
  setDarkTheme(!enabled)
})