(async () => {
  const creditsContainer = document.querySelector("#credits-container")

  const response = await fetch("/contributors/contributors.json")
  const jsonData = await response.json()
  const contributorsArray = jsonData.contributors

  let totalWeight = 0
  contributorsArray.forEach(con => { if(con.weight) totalWeight += con.weight })

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

        if(contributor.github) {
          const link = document.createElement("a")
          link.textContent = "Github"
          link.href = `https://github.com/${contributor.github}`
          link.target = "_blank"
          creditSection.appendChild(link)
        }

        creditSection.appendChild(document.createElement("hr"))
      }
      else {
        const lineP = document.createElement("p")

        const contributionEmoji = jsonData.lang.emojis[text]
        const langText = jsonData.lang[creditsLang]?.[text] || text
        lineP.textContent = `${contributionEmoji ? contributionEmoji + " " : ""}${langText}`
        creditSection.appendChild(lineP)
      }
    }

    const contributionPercentage = Math.round(((contributor.weight ?? 0) / totalWeight) * 100)

    const contributionPercentageDiv = document.createElement("div")
    contributionPercentageDiv.title = "Contribution Percentage"
    contributionPercentageDiv.className = "contribution-percentage"
    contributionPercentageDiv.textContent = `${contributionPercentage}%`
    creditSection.appendChild(contributionPercentageDiv)

    creditsContainer.appendChild(creditSection)
  }
})()