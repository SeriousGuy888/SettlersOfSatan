<template></template>

<script>
import { useStore } from "vuex"
import { useSound } from "@vueuse/sound"

export default {
  setup() {
    const store = useStore()
    store.state.prefs = JSON.parse(localStorage.getItem("prefs")) || {}
    if(!store.state.prefs.volume) store.state.prefs.volume = 50

    const volume = store.state.prefs.volume / 100
    const soundOpts = { volume }

    return {
      sounds: {
        fifteen_seconds_left: useSound(require("../sounds/fifteen_seconds_left.wav"), soundOpts),
        lost: useSound(require("../sounds/lost.wav"), soundOpts),
        win_hot: useSound(require("../sounds/win_hot.wav"), soundOpts),
        win_wava: useSound(require("../sounds/win_wava.wav"), soundOpts),
        your_turn: useSound(require("../sounds/your_turn.mp3"), soundOpts),
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