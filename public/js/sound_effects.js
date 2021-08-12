class Sound {
  constructor(src) {
    this.sound = document.createElement("audio")
    this.sound.src = src
    this.sound.setAttribute("preload", "auto")
    this.sound.setAttribute("controls", "none")
    this.sound.style.display = "none"
    document.body.appendChild(this.sound)
  }
  play() {
    this.sound.play()
  }
  stop() {
    this.sound.pause()
  }
}

document.querySelector("#your-turn").onclick = () => {
  const sound = new Sound("/sounds/acapellayour_turn.mp3")
  sound.play()
}