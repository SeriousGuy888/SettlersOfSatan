const darkThemeToggle = document.querySelector("#dark-theme-toggle")

const setDarkTheme = (enabled) => {
  localStorage.setItem("darkTheme", enabled)
  document.body.classList.toggle("dark-theme", enabled)
  if(darkThemeToggle) {
    try {
      let themeTexts = ["Light Theme", "Dark Theme"]
      if(creditsLang === "billzonian") themeTexts = ["Bruiht Ceme", "Nuiht Ceme"]
      darkThemeToggle.textContent = enabled ? "🌞 " + themeTexts[0] : "🌛 " + themeTexts[1]
    } catch {} // swallow the error so it doesnt print in the browser console if this is not the credits page
  }
}
const getDarkTheme = () => localStorage.getItem("darkTheme") === "true" // localstorage only takes strings :(
setDarkTheme(getDarkTheme())

if(darkThemeToggle) darkThemeToggle.addEventListener("click", () => {
  let enabled = getDarkTheme()
  setDarkTheme(!enabled)
})