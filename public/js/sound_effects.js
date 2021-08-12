const retrievedSoundSettings = localStorage.getItem("soundSettings")
let soundSettings = JSON.parse(retrievedSoundSettings)
if(!soundSettings) {
  soundSettings = {
    volume: 1
  }
}

localStorage.setItem("soundSettings", JSON.stringify(soundSettings))


class Sound {
  constructor(fileName) {
    this.sound = document.createElement("audio")
    this.sound.src = `/sounds/${fileName}`
    this.sound.setAttribute("preload", "auto")
    this.sound.setAttribute("controls", "none")
    this.sound.style.display = "none"
    this.sound.volume = (soundSettings.volume * 0.07)
    document.body.appendChild(this.sound)
  }
  play() {
    this.sound.play()
  }
  stop() {
    this.sound.pause()
  }
}



let soundEffects = {
  fifteenSecondsLeft: "fifteen_seconds_left.wav"
}
Object.keys(soundEffects).forEach(k => soundEffects[k] = new Sound(soundEffects[k]))