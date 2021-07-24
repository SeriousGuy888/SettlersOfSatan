(async () => {
  const creditsContainer = document.querySelector("#credits-container")

  const response = await fetch("/contributors/contributors.json")
  const jsonData = await response.json()
  const contributorsArray = jsonData.contributors

  for(let contributor of contributorsArray) {
    const creditSection = document.createElement("div")
    creditSection.classList.add(["credit-section"])
    
    const sectionLines = []
    sectionLines.push(contributor.name)
    contributor.contributions.forEach(e => sectionLines.push(e))

    for(let j in sectionLines) {
      const text = sectionLines[j]
      
      if(j == 0) {
        const lineH = document.createElement("h3")
        lineH.className = "credit-section-title"
        lineH.textContent = text
        creditSection.appendChild(lineH)
      }
      else {
        const lineP = document.createElement("p")

        const contributionEmoji = jsonData.lang.emojis[text]
        const langText = jsonData.lang[creditsLang]?.[text] || text
        lineP.textContent = `${contributionEmoji ? contributionEmoji + " " : ""}${langText}`
        creditSection.appendChild(lineP)
      }
    }

    creditsContainer.appendChild(creditSection)
  }
})()