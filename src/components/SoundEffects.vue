<template></template>

<script>
import { useStore } from "vuex"

export default {
  setup() {
    const sounds = {
      buy_development_card: "buy_development_card.wav",
      fifteen_seconds_left: "fifteen_seconds_left.wav",
      lost: "lost.wav",
      place: "place.wav",
      trade: "trade.wav",
      win_hot: "win_hot.wav",
      win_wava: "win_wava.wav",
      your_turn: "your_turn.wav",
    }
    for(const soundName of Object.keys(sounds)) {
      const filePath = `./sounds/${sounds[soundName]}`
      sounds[soundName] = new Audio(filePath)
    }

    return { sounds }
  },
  mounted() {
    const store = useStore()
    
    socket.on("play_sound", data => {
      const volume = Number(store.state.prefs.volume) / 100
      const soundName = data.sound
      const sound = this.sounds[soundName]
      if(sound instanceof Audio) {
        sound.volume = volume
        sound.play()
        console.log(`Played sound ${soundName}`)
      } else {
        console.log(`Sound ${soundName} does not exist.`)
      }
    })
  },
}
</script>