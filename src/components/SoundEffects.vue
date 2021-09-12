<template></template>

<script>
import { useStore } from "vuex"
import { useSound } from "@vueuse/sound"

export default {
  setup() {
    const store = useStore()
    if(!store.state.prefs.volume) store.state.prefs.volume = 50

    const volume = Number(store.state.prefs.volume) / 100
    const soundOpts = { volume }

    return {
      sounds: {
        buy_development_card: useSound(require(`../sounds/buy_development_card.wav`), soundOpts),
        fifteen_seconds_left: useSound(require(`../sounds/fifteen_seconds_left.wav`), soundOpts),
        lost: useSound(require("../sounds/lost.wav"), soundOpts),
        place: useSound(require("../sounds/place.wav"), soundOpts),
        win_hot: useSound(require("../sounds/win_hot.wav"), soundOpts),
        win_wava: useSound(require("../sounds/win_wava.wav"), soundOpts),
        your_turn: useSound(require("../sounds/your_turn.wav"), soundOpts),
      },
    }
  },
  mounted() {
    socket.on("play_sound", data => {
      const soundName = data.sound
      if(this.sounds[soundName].play) {
        this.sounds[soundName].play()
        console.log(`Played sound ${soundName}`)
      } else {
        console.log(`Sound ${soundName} does not exist.`)
      }
    })
  },
}
</script>