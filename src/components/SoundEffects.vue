<template></template>

<script>
import { useStore } from "vuex"
import { useSound } from "@vueuse/sound"

export default {
  setup() {

    return {
      sounds: {
        buy_development_card: new Audio("/sounds/buy_development_card.wav"),
        fifteen_seconds_left: new Audio("../sounds/fifteen_seconds_left.wav"),
        lost: new Audio("../sounds/lost.wav"),
        place: new Audio("../sounds/place.wav"),
        win_hot: new Audio("../sounds/win_hot.wav"),
        win_wava: new Audio("../sounds/win_wava.wav"),
        your_turn: new Audio("/sounds/your_turn.wav"),
      },
    }
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