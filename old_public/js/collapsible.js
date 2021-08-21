const allCollapsibles = document.getElementsByClassName("collapsible");
let i;

for(i = 0; i < allCollapsibles.length; i++) {
  allCollapsibles[i].addEventListener("click", function() {
    this.classList.toggle("collapsible-active")
    const content = this.nextElementSibling
    if(content.style.display !== "none") content.style.display = "none"
    else content.style.display = null
  })
}