const resourceDivs = {
  bricks: document.querySelector("#resource-bricks"),
  lumber: document.querySelector("#resource-lumber"),
  wool: document.querySelector("#resource-wool"),
  wheat: document.querySelector("#resource-wheat"),
  ore: document.querySelector("#resource-ore"),
}

const refreshResourceCards = () => {
  for(let divKey in resourceDivs) {
    const para = resourceDivs[divKey].querySelector(".resource > .count")
    para.textContent = currentGameData.me.resources[divKey]
  }
}