let creditsLang
if(window.location.pathname.endsWith("contributors")) creditsLang = "english"
if(window.location.pathname.endsWith("kontributeurs")) creditsLang = "billzonian"

if(creditsLang === "billzonian") {
  document.querySelector("#contributors-page-title").textContent = "Kontributeurs"

  const switchLangLink = document.querySelector("#switch-lang-link")
  switchLangLink.href = "/contributors"
  switchLangLink.textContent = "Switch to English"
}